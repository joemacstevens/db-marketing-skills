#!/usr/bin/env node
/**
 * MindBody AddClientToClass diagnostic probe.
 *
 * Goal: empirically determine whether the existing staff token + source-name
 * grant has permission to call POST /public/v6/class/addclienttoclass — the
 * per-class-session booking endpoint that the rest of the codebase has never
 * exercised.
 *
 * Safety: uses Test:true on the booking call. Per MindBody docs, Test mode
 * validates the request without committing the booking. No real reservation
 * is created, no email is sent, no charge is run.
 *
 * Usage:
 *   node scripts/probe-book-class.mjs
 *   node scripts/probe-book-class.mjs --client-id 12345        # use a known ClientId
 *   node scripts/probe-book-class.mjs --class-id 67890         # use a known ClassId
 *   node scripts/probe-book-class.mjs --commit                 # actually book (Test:false)
 *
 * Env: reads ../landing-page/.env.local
 *   MINDBODY_API_KEY_DBE, MINDBODY_SITE_ID, MINDBODY_SOURCE_NAME,
 *   MINDBODY_STAFF_USER, MINDBODY_STAFF_PASS, MINDBODY_TEST_CLIENT_EMAIL
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ENV_PATH = resolve(__dirname, "../landing-page/.env.local");
const MB_BASE = "https://api.mindbodyonline.com/public/v6";

// ---- env loading -----------------------------------------------------------

function loadEnv(path) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch (err) {
    fatal(`Could not read ${path}: ${err.message}`);
  }
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let [, key, val] = m;
    val = val.trim().replace(/^["'](.*)["']$/, "$1");
    if (!(key in process.env)) process.env[key] = val;
  }
}

// ---- args ------------------------------------------------------------------

function parseArgs(argv) {
  const args = { commit: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--commit") args.commit = true;
    else if (a === "--client-id") args.clientId = argv[++i];
    else if (a === "--class-id") args.classId = argv[++i];
    else if (a === "--email") args.email = argv[++i];
  }
  return args;
}

// ---- HTTP helpers ----------------------------------------------------------

function mbHeaders(token) {
  const h = {
    "Api-Key": process.env.MINDBODY_API_KEY_DBE,
    SiteId: process.env.MINDBODY_SITE_ID,
    "Content-Type": "application/json",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function mbIssueToken() {
  const r = await fetch(`${MB_BASE}/usertoken/issue`, {
    method: "POST",
    headers: mbHeaders(),
    body: JSON.stringify({
      Username: process.env.MINDBODY_STAFF_USER,
      Password: process.env.MINDBODY_STAFF_PASS,
    }),
  });
  const text = await r.text();
  if (!r.ok) fatal(`token issue ${r.status}: ${text}`);
  return JSON.parse(text).AccessToken;
}

async function mbGet(token, path, params = {}) {
  const url = new URL(MB_BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }
  const r = await fetch(url, { headers: mbHeaders(token) });
  const text = await r.text();
  if (!r.ok) throw new Error(`${path} ${r.status}: ${text}`);
  return JSON.parse(text);
}

async function mbPost(token, path, body) {
  const r = await fetch(MB_BASE + path, {
    method: "POST",
    headers: mbHeaders(token),
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { _raw: text };
  }
  return { ok: r.ok, status: r.status, body: parsed };
}

// ---- domain helpers --------------------------------------------------------

function nextWeekRange() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  return {
    StartDateTime: start.toISOString().slice(0, 19),
    EndDateTime: end.toISOString().slice(0, 19),
  };
}

async function pickBookableClass(token) {
  const range = nextWeekRange();
  const data = await mbGet(token, "/class/classes", {
    ...range,
    Limit: 200,
  });
  const all = data.Classes || [];
  // Filter to future, not canceled, not full, has Id.
  const now = Date.now();
  const candidates = all.filter((c) => {
    if (!c.Id) return false;
    if (c.IsCanceled) return false;
    const t = c.StartDateTime ? Date.parse(c.StartDateTime) : 0;
    if (!t || t < now + 60 * 60 * 1000) return false; // at least 1hr out
    const cap = c.MaxCapacity ?? 0;
    const booked = c.TotalBooked ?? 0;
    return cap === 0 || booked < cap;
  });
  return { candidates, total: all.length };
}

async function findClientByEmail(token, email) {
  const data = await mbGet(token, "/client/clients", {
    SearchText: email,
    Limit: 5,
  });
  const list = data.Clients || [];
  const lower = email.toLowerCase();
  return list.find((c) => (c.Email || "").toLowerCase() === lower) || list[0] || null;
}

// ---- error interpretation --------------------------------------------------

function interpretBookingResult(res) {
  const body = res.body || {};
  const err = body.Error || body.error || null;
  const code = err?.Code || err?.Message || body?.Code || null;
  const message = err?.Message || body?.Message || JSON.stringify(body).slice(0, 400);

  // 200 OK with a Visit (object or array) means booking validated/created.
  // AddClientToClass returns Visit as a single object; some related endpoints return arrays.
  if (res.ok) {
    const visit = Array.isArray(body.Visit) ? body.Visit[0] : body.Visit;
    if (visit && (visit.Action || visit.ClassId || visit.Id)) {
      return {
        verdict: "SUCCESS",
        summary:
          `AddClientToClass returned a Visit (Action: ${visit.Action || "n/a"}). ` +
          "Endpoint and permissions are good.",
        detail: visit,
      };
    }
  }

  const known = {
    DeniedAccess: {
      verdict: "PERMISSION_DENIED",
      remediation:
        "Staff role behind MINDBODY_STAFF_USER lacks class-booking permission. Don needs to: " +
        "MindBody Business → Manager Tools → Staff → Edit role → enable 'Class Booking' " +
        "(under Booking & Scheduling permissions), then save.",
    },
    InvalidUserAccessLevel: {
      verdict: "PERMISSION_DENIED",
      remediation:
        "Staff role lacks the access level needed for class booking. Same fix as DeniedAccess: " +
        "grant the role the Class Booking permission in MindBody Business.",
    },
    InvalidPermissionConfiguration: {
      verdict: "PERMISSION_DENIED",
      remediation:
        "Permission set is misconfigured. Check the role assigned to the staff user — likely " +
        "missing Class Booking or has a conflicting deny rule.",
    },
    InvalidStaffCredentials: {
      verdict: "AUTH_FAILED",
      remediation:
        "Staff token didn't authenticate. Likely password rotated. Refresh MINDBODY_STAFF_PASS in .env.local.",
    },
    ClassRequiresPayment: {
      verdict: "PAYMENT_REQUIRED",
      remediation:
        "Token works! But this client has no usable pricing option for this class. " +
        "Either pass a ClientServiceId on the request, set RequirePayment:false, or first call " +
        "GetClientServices to see what packs/memberships the client has.",
    },
    PaymentRequired: {
      verdict: "PAYMENT_REQUIRED",
      remediation:
        "Same as ClassRequiresPayment — needs ClientServiceId or RequirePayment:false.",
    },
    ClassSignUpsFull: {
      verdict: "CLASS_FULL",
      remediation: "Class is full. Re-run with --class-id pointing to a different class.",
    },
    ClientIsAlreadyBooked: {
      verdict: "ALREADY_BOOKED",
      remediation:
        "Client is already booked for this class. Endpoint and permissions are good — " +
        "this is the expected idempotency response. Re-run with --class-id pointing to a different class to verify a fresh booking.",
    },
    SchedulingWindowViolated: {
      verdict: "WINDOW_VIOLATED",
      remediation:
        "Endpoint and permissions are good. The chosen class is outside the booking window " +
        "(too far in advance, or too close to start). Re-run with --class-id for a class inside the window.",
    },
    SchedulingRestrictionsViolated: {
      verdict: "WINDOW_VIOLATED",
      remediation:
        "Endpoint and permissions are good. Hit a scheduling rule (e.g. 'must book ≥ 1hr before'). " +
        "Re-run with a different class.",
    },
  };

  const hit = code && known[code];
  if (hit) return { verdict: hit.verdict, summary: hit.remediation, code, message, raw: body };

  if (res.status === 401 || res.status === 403) {
    return {
      verdict: "PERMISSION_DENIED",
      summary:
        `HTTP ${res.status} with no recognized error code. ` +
        "Most common cause: staff role missing Class Booking permission. " +
        "Less common: source-name not granted to the org (but you said Don approved that).",
      message,
      raw: body,
    };
  }

  return {
    verdict: "UNKNOWN",
    summary: `Unrecognized response. Paste this into the chat to diagnose: ${JSON.stringify(body)}`,
    code,
    message,
    raw: body,
  };
}

// ---- main ------------------------------------------------------------------

function fatal(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function header(s) {
  console.log("\n" + "─".repeat(60));
  console.log(s);
  console.log("─".repeat(60));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  loadEnv(ENV_PATH);

  for (const k of [
    "MINDBODY_API_KEY_DBE",
    "MINDBODY_SITE_ID",
    "MINDBODY_STAFF_USER",
    "MINDBODY_STAFF_PASS",
  ]) {
    if (!process.env[k]) fatal(`${k} not set in ${ENV_PATH}`);
  }
  const testEmail = args.email || process.env.MINDBODY_TEST_CLIENT_EMAIL;
  if (!testEmail && !args.clientId) {
    fatal(
      "Need a test client. Either set MINDBODY_TEST_CLIENT_EMAIL in .env.local, " +
        "pass --email <addr>, or pass --client-id <id>."
    );
  }

  header("Step 1 — Issue staff token");
  const token = await mbIssueToken();
  console.log(`✓ Staff token issued (length ${token.length})`);

  header("Step 2 — Resolve test client");
  let clientId = args.clientId;
  if (!clientId) {
    const client = await findClientByEmail(token, testEmail);
    if (!client) fatal(`No client found for email ${testEmail}. Pass --client-id explicitly.`);
    clientId = client.Id || client.UniqueId;
    console.log(
      `✓ Found client: ${client.FirstName} ${client.LastName} <${client.Email}> — id ${clientId}`
    );
  } else {
    console.log(`✓ Using --client-id ${clientId}`);
  }

  header("Step 3 — Pick a bookable class");
  let classId = args.classId;
  if (!classId) {
    const { candidates, total } = await pickBookableClass(token);
    console.log(`  Fetched ${total} classes in next 7 days; ${candidates.length} bookable.`);
    if (candidates.length === 0) {
      fatal(
        "No bookable classes found in the next 7 days. Pass --class-id explicitly with a known ID."
      );
    }
    const c = candidates[0];
    classId = c.Id;
    console.log(
      `✓ Using class id ${c.Id} — "${c.ClassDescription?.Name}" with ${
        c.Staff?.Name || "(no staff)"
      } at ${c.StartDateTime}`
    );
    console.log(`  Capacity ${c.TotalBooked || 0}/${c.MaxCapacity || "∞"}`);
  } else {
    console.log(`✓ Using --class-id ${classId}`);
  }

  header(`Step 4 — Call AddClientToClass${args.commit ? " (REAL BOOKING)" : " (Test:true)"}`);
  const body = {
    ClientId: String(clientId),
    ClassId: Number(classId),
    Test: !args.commit,
    RequirePayment: false,
    SendEmail: false,
    Waitlist: false,
  };
  console.log(`  Request body: ${JSON.stringify(body)}`);
  const res = await mbPost(token, "/class/addclienttoclass", body);
  console.log(`  HTTP ${res.status}`);

  header("Step 5 — Verdict");
  const v = interpretBookingResult(res);
  console.log(`Verdict: ${v.verdict}`);
  if (v.code) console.log(`Code:    ${v.code}`);
  if (v.message) console.log(`Message: ${v.message}`);
  console.log(`\n${v.summary}`);
  if (v.detail) {
    console.log("\nVisit returned:");
    console.log(JSON.stringify(v.detail, null, 2));
  } else if (v.raw) {
    console.log("\nRaw response:");
    console.log(JSON.stringify(v.raw, null, 2));
  }
  console.log("");

  // Exit non-zero on anything that's not a clean success or expected idempotency,
  // so this can be wired into a smoke check later.
  const okVerdicts = new Set(["SUCCESS", "ALREADY_BOOKED", "WINDOW_VIOLATED"]);
  process.exit(okVerdicts.has(v.verdict) ? 0 : 1);
}

main().catch((err) => {
  console.error("\n✗ Probe failed unexpectedly:");
  console.error(err.stack || err.message || err);
  process.exit(2);
});
