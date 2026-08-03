#!/usr/bin/env node
/**
 * GO-LIVE: the August lobby drop — UBE Challenge + DB Run Club (and the July
 * challenge swap that goes with them).
 *
 * Four panels move in one pass:
 *   - `kettlebell-winners` goes ON   (created from seed if it isn't in Blob yet)
 *   - `kettlebell-carry`   goes OFF  (the July board comes down)
 *   - `ube-challenge`      goes ON   (new, August challenge)
 *   - `run-club`           goes ON   (new, DB Run Club)
 * …then the rotation is reordered so the challenge story reads in sequence:
 * carry → ube-challenge → kettlebell-winners, and run-club sits right after
 * sunrise-strength (it runs during that class).
 *
 * IDEMPOTENT BY DESIGN. The Aug 1 script `main-site/scripts/add-kettlebell-winners-panel.mjs`
 * may or may not have already run, so every decision branches on the LIVE Blob
 * state, never on the repo seed. Re-running this after a successful pass is a
 * no-op that just re-asserts the end state.
 *
 * RUN ONLY AFTER JOEY APPROVES. Prereqs, in order:
 *   1. Commit + push db-main-site (the two new components, registry, seed,
 *      admin split-board entry, static UBE stills) and WAIT for Vercel.
 *      Data before code renders the new ids as a generic PanelDefault on the TV.
 *   2. Verify the PROD previews: /lobby/preview/ube-challenge and /lobby/preview/run-club
 *   3. Start the local dev server that holds the prod Blob token:
 *        cd main-site && npm run dev -- --port 5174
 *      (house rule: ALL panel-data writes go through the admin API — no
 *      hand-rolled panel-config blob puts)
 *   4. node scripts/golive-august-panels.mjs --dry   # inspect the op plan
 *      node scripts/golive-august-panels.mjs         # execute
 *
 * Live state is READ straight from Blob (cache-busted) the way
 * main-site/scripts/add-kettlebell-winners-panel.mjs does, but every WRITE goes
 * through POST/PATCH on /api/admin/panels.
 *
 * The TV self-reloads within ~60s; panel data refreshes on the next cycle
 * (30s config cache), so allow ~90s before checking the lobby.
 */

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SITE = resolve(ROOT, "main-site");
const BASE = process.env.GOLIVE_BASE || "http://localhost:5174";
const DRY = process.argv.includes("--dry");

const LIVE_KEY = "lobby-config/panels.json";
const CARRY = "kettlebell-carry";
const WINNERS = "kettlebell-winners";
const UBE = "ube-challenge";
const RUN = "run-club";
const SUNRISE = "sunrise-strength";

const CARRY_OFF_NOTE =
  "July challenge closed 7/31 — superseded by kettlebell-winners + ube-challenge.";

for (const line of readFileSync(resolve(SITE, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error("BLOB_READ_WRITE_TOKEN missing from main-site/.env.local — can't read live state");
}
if (!DRY && !process.env.ADMIN_PASSWORD) {
  throw new Error("ADMIN_PASSWORD missing from main-site/.env.local — can't write through the admin API");
}

const require = createRequire(resolve(SITE, "package.json"));
const { list } = require("@vercel/blob");

// ---------------------------------------------------------------- live state

/** Read the LIVE panels array straight out of Blob, cache-busted. Read-only —
    this is the only thing we trust to decide what still needs doing. */
async function fetchLivePanels() {
  const found = await list({ prefix: LIVE_KEY });
  const exact = found.blobs.find((b) => b.pathname === LIVE_KEY);
  if (!exact) throw new Error(`live panels blob not found at ${LIVE_KEY} — aborting`);
  const res = await fetch(`${exact.url}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`blob fetch failed: ${res.status}`);
  const panels = await res.json();
  if (!Array.isArray(panels)) throw new Error("live panels blob is not an array — aborting");
  return panels;
}

const seed = JSON.parse(readFileSync(resolve(SITE, "src/lib/data/lobby-panels.json"), "utf8"));

/** Seed entry, flipped live: enabled on, build-time note dropped. */
function seedEntryLive(id) {
  const entry = seed.find((p) => p.id === id);
  if (!entry) throw new Error(`${id} missing from the seed file — aborting`);
  const copy = structuredClone(entry);
  copy.enabled = true;
  delete copy.enabledNote;
  return copy;
}

const live = await fetchLivePanels();
const liveById = new Map(live.map((p) => [p.id, p]));
const state = (id) => {
  const p = liveById.get(id);
  if (!p) return "absent";
  return p.enabled === false ? "disabled" : "enabled";
};

console.log(`Live panels: ${live.length} entries (from Blob ${LIVE_KEY})`);
for (const id of [CARRY, WINNERS, UBE, RUN, SUNRISE]) {
  console.log(`  ${id.padEnd(20)} ${state(id)}`);
}

// ------------------------------------------------------------------ op plan

/** @type {Array<{ kind: 'create'|'patch', id: string, why: string, body: any }>} */
const ops = [];

// 1. kettlebell-winners — absent → create ON; disabled → flip ON; already on → skip.
if (state(WINNERS) === "absent") {
  ops.push({
    kind: "create",
    id: WINNERS,
    why: "not in Blob (the Aug 1 script never ran) — create from seed, enabled",
    body: { mode: "create", panel: seedEntryLive(WINNERS) },
  });
} else if (state(WINNERS) === "disabled") {
  ops.push({
    kind: "patch",
    id: WINNERS,
    why: "in Blob but off — flip on",
    body: { id: WINNERS, patch: { enabled: true } },
  });
}

// 2. kettlebell-carry — the July board comes down. Only touch it if it's on.
if (state(CARRY) === "enabled") {
  ops.push({
    kind: "patch",
    id: CARRY,
    why: "July challenge is over — take the board down",
    body: { id: CARRY, patch: { enabled: false, enabledNote: CARRY_OFF_NOTE } },
  });
}

// 3 + 4. The two new August panels.
for (const id of [UBE, RUN]) {
  if (state(id) === "absent") {
    ops.push({
      kind: "create",
      id,
      why: "new August panel — create from seed, enabled",
      body: { mode: "create", panel: seedEntryLive(id) },
    });
  } else if (state(id) === "disabled") {
    ops.push({
      kind: "patch",
      id,
      // PATCH is a shallow merge, so a key can't be deleted — blanking the
      // build-time "ships disabled" note is the closest we get, and it keeps
      // /admin from reading like the panel is still waiting to go up.
      why: "already in Blob but off — flip on",
      body: { id, patch: { enabled: true, enabledNote: "" } },
    });
  }
}

/** Full ordered id list for the reorder call.
    reorderPanels() drops anything NOT in the list to the end, so this has to be
    the complete sequence, not just the moved ids. Everything we don't place
    explicitly keeps its live relative order. */
function plannedOrder(panels) {
  const ids = panels.map((p) => p.id).filter((id) => id !== UBE && id !== WINNERS && id !== RUN);
  const insertAfter = (anchor, id) => {
    const i = ids.indexOf(anchor);
    if (i === -1) ids.push(id);
    else ids.splice(i + 1, 0, id);
  };
  insertAfter(CARRY, UBE); // challenge story: last month's board …
  insertAfter(UBE, WINNERS); // … this month's challenge … last month's champs
  insertAfter(SUNRISE, RUN); // run club sits with the class it runs during
  return ids;
}

console.log(`\nOP PLAN (${ops.length} write${ops.length === 1 ? "" : "s"} + 1 reorder):`);
if (ops.length === 0) console.log("  (no create/patch needed — everything is already in position)");
for (const op of ops) {
  console.log(`  ${op.kind.toUpperCase().padEnd(6)} ${op.id.padEnd(20)} — ${op.why}`);
}
// Predicted post-create order: creates land at the end of the array.
const predicted = [...live.map((p) => p.id), ...ops.filter((o) => o.kind === "create").map((o) => o.id)];
console.log(`  REORDER → ${plannedOrder(predicted.map((id) => ({ id }))).join(", ")}`);

if (DRY) {
  console.log("\n--dry: nothing written.");
  process.exit(0);
}

// -------------------------------------------------------------------- write

const login = await fetch(`${BASE}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
});
if (!login.ok) throw new Error(`admin login failed: ${login.status} (is the dev server on ${BASE}?)`);
const cookie = login.headers.get("set-cookie")?.split(";")[0];
if (!cookie) throw new Error("no admin session cookie returned");

async function callAdmin(method, body) {
  const res = await fetch(`${BASE}/api/admin/panels`, {
    method,
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify(body),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok || !out.ok) throw new Error(`${method} failed: ${JSON.stringify(out)}`);
  return out.panels;
}

for (const op of ops) {
  await callAdmin(op.kind === "create" ? "POST" : "PATCH", op.body);
  console.log(`✓ ${op.kind} ${op.id}`);
}

// Reorder against what's actually there now, not against the prediction.
const afterWrites = await fetchLivePanels();
await callAdmin("POST", { mode: "reorder", ids: plannedOrder(afterWrites) });
console.log("✓ reorder");

// ------------------------------------------------------------------- assert

const final = await fetchLivePanels();
const idx = (id) => final.findIndex((p) => p.id === id);
const count = (id) => final.filter((p) => p.id === id).length;
const on = (id) => {
  const p = final.find((x) => x.id === id);
  return !!p && p.enabled !== false;
};

const checks = [
  [`${CARRY} is OFF`, idx(CARRY) === -1 || !on(CARRY)],
  [`${WINNERS} is ON`, on(WINNERS)],
  [`${UBE} is ON`, on(UBE)],
  [`${RUN} is ON`, on(RUN)],
  [`${UBE} appears exactly once`, count(UBE) === 1],
  [`${RUN} appears exactly once`, count(RUN) === 1],
  [`${WINNERS} appears exactly once`, count(WINNERS) === 1],
  [`${UBE} sits right after ${CARRY}`, idx(CARRY) === -1 || idx(UBE) === idx(CARRY) + 1],
  [`${WINNERS} sits right after ${UBE}`, idx(WINNERS) === idx(UBE) + 1],
  [`${RUN} sits right after ${SUNRISE}`, idx(SUNRISE) === -1 || idx(RUN) === idx(SUNRISE) + 1],
];

console.log("\nEND STATE:");
let failed = 0;
for (const [label, ok] of checks) {
  if (!ok) failed++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
}

if (failed) {
  console.error(`\n${failed} check(s) FAILED — inspect /admin/panels before the TV cycles.`);
  process.exit(1);
}
console.log(
  "\n✓ All checks passed. Lobby TV picks this up within ~90s (60s reload + 30s config cache)."
);
