/**
 * Reusable MindBody booking module.
 *
 * Server-only — never import from a browser bundle. Reads creds from process.env
 * (same vars as landing-page/api/register.js).
 *
 * Public API:
 *   getStaffToken({ forceRefresh? })           → string
 *   findClientByEmail(email)                    → Client | null
 *   findOrCreateClient({ email, ... })          → Client
 *   listUpcomingClasses({ startDate, endDate, classDescriptionId? })
 *                                               → Class[]
 *   getClientServices(clientId)                 → ClientService[]
 *   bookClient({ clientId, classId, clientServiceId?, waitlist?, test?, sendEmail? })
 *                                               → BookingResult
 *
 *   BookingResult shape:
 *     { ok: true,  visit, raw }
 *     { ok: false, code, message, raw }
 *     code ∈ 'PERMISSION_DENIED' | 'AUTH_FAILED' | 'PAYMENT_REQUIRED' |
 *            'CLASS_FULL' | 'ALREADY_BOOKED' | 'WINDOW_VIOLATED' | 'UNKNOWN'
 */

const MB_BASE = "https://api.mindbodyonline.com/public/v6";

const TOKEN_TTL_MS = 6 * 24 * 60 * 60 * 1000; // 6 days; MB tokens last 7 idle
const tokenCache = new Map(); // sourceName → { token, expiresAt }

// ---- internal helpers ------------------------------------------------------

function requiredEnv(key) {
  const v = process.env[key];
  if (!v) throw new Error(`${key} not set in environment`);
  return v;
}

function mbHeaders(token) {
  const h = {
    "Api-Key": requiredEnv("MINDBODY_API_KEY_DBE"),
    SiteId: requiredEnv("MINDBODY_SITE_ID"),
    "Content-Type": "application/json",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function mbFetch(path, { method = "GET", token, body, query } = {}) {
  const url = new URL(MB_BASE + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url, {
    method,
    headers: mbHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { _raw: text };
  }
  return { ok: res.ok, status: res.status, body: parsed };
}

// ---- token cache -----------------------------------------------------------

export async function getStaffToken({ forceRefresh = false } = {}) {
  const sourceName = process.env.MINDBODY_SOURCE_NAME || "_default";
  const cached = tokenCache.get(sourceName);
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) return cached.token;

  const res = await mbFetch("/usertoken/issue", {
    method: "POST",
    body: {
      Username: requiredEnv("MINDBODY_STAFF_USER"),
      Password: requiredEnv("MINDBODY_STAFF_PASS"),
    },
  });
  if (!res.ok) throw new Error(`UserToken/Issue ${res.status}: ${JSON.stringify(res.body)}`);
  const token = res.body.AccessToken;
  if (!token) throw new Error("UserToken/Issue: no AccessToken in response");
  tokenCache.set(sourceName, { token, expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}

// ---- clients ---------------------------------------------------------------

export async function findClientByEmail(email) {
  if (!email) return null;
  const token = await getStaffToken();
  const res = await mbFetch("/client/clients", {
    token,
    query: { SearchText: email, Limit: 5 },
  });
  if (!res.ok) throw new Error(`client/clients ${res.status}: ${JSON.stringify(res.body)}`);
  const list = res.body.Clients || [];
  const lower = email.toLowerCase();
  return list.find((c) => (c.Email || "").toLowerCase() === lower) || null;
}

export async function findOrCreateClient({
  email,
  firstName,
  lastName,
  phone,
  notes,
  referredBy = "DB Native Booking",
  sendAccountEmails = true,
}) {
  if (!email) throw new Error("findOrCreateClient: email required");
  const existing = await findClientByEmail(email);
  if (existing) return existing;
  if (!firstName || !lastName) {
    throw new Error("findOrCreateClient: firstName + lastName required to create new client");
  }
  const token = await getStaffToken();
  const res = await mbFetch("/client/addclient", {
    method: "POST",
    token,
    body: {
      Client: {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        MobilePhone: phone,
        ReferredBy: referredBy,
        Notes: notes,
        SendAccountEmails: sendAccountEmails,
      },
    },
  });
  if (!res.ok) throw new Error(`client/addclient ${res.status}: ${JSON.stringify(res.body)}`);
  return res.body.Client;
}

export async function getClientServices(clientId) {
  if (!clientId) throw new Error("getClientServices: clientId required");
  const token = await getStaffToken();
  const res = await mbFetch("/client/clientservices", {
    token,
    query: { ClientId: String(clientId), Limit: 100 },
  });
  if (!res.ok) throw new Error(`client/clientservices ${res.status}: ${JSON.stringify(res.body)}`);
  return res.body.ClientServices || [];
}

// ---- classes ---------------------------------------------------------------

export async function listUpcomingClasses({ startDate, endDate, classDescriptionId, locationId } = {}) {
  const token = await getStaffToken();
  const start = startDate || new Date().toISOString().slice(0, 19);
  const end =
    endDate ||
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19);
  const res = await mbFetch("/class/classes", {
    token,
    query: {
      StartDateTime: start,
      EndDateTime: end,
      ClassDescriptionIds: classDescriptionId,
      LocationIds: locationId,
      Limit: 200,
    },
  });
  if (!res.ok) throw new Error(`class/classes ${res.status}: ${JSON.stringify(res.body)}`);
  return res.body.Classes || [];
}

// ---- booking ---------------------------------------------------------------

const BOOKING_ERROR_MAP = {
  DeniedAccess: "PERMISSION_DENIED",
  InvalidUserAccessLevel: "PERMISSION_DENIED",
  InvalidPermissionConfiguration: "PERMISSION_DENIED",
  InvalidStaffCredentials: "AUTH_FAILED",
  ClassRequiresPayment: "PAYMENT_REQUIRED",
  PaymentRequired: "PAYMENT_REQUIRED",
  ClassSignUpsFull: "CLASS_FULL",
  ClientIsAlreadyBooked: "ALREADY_BOOKED",
  SchedulingWindowViolated: "WINDOW_VIOLATED",
  SchedulingRestrictionsViolated: "WINDOW_VIOLATED",
};

function mapBookingError(res) {
  const body = res.body || {};
  const err = body.Error || body.error || null;
  const code = err?.Code || body?.Code || null;
  const message = err?.Message || body?.Message || JSON.stringify(body).slice(0, 400);
  const mapped = code ? BOOKING_ERROR_MAP[code] : null;
  if (mapped) return { ok: false, code: mapped, message, raw: body };
  if (res.status === 401 || res.status === 403) {
    return { ok: false, code: "PERMISSION_DENIED", message, raw: body };
  }
  return { ok: false, code: "UNKNOWN", message, raw: body };
}

export async function bookClient({
  clientId,
  classId,
  clientServiceId,
  waitlist = false,
  test = false,
  sendEmail = true,
  requirePayment = false,
}) {
  if (!clientId) throw new Error("bookClient: clientId required");
  if (!classId) throw new Error("bookClient: classId required");

  const token = await getStaffToken();
  const body = {
    ClientId: String(clientId),
    ClassId: Number(classId),
    Test: !!test,
    RequirePayment: !!requirePayment,
    SendEmail: !!sendEmail,
    Waitlist: !!waitlist,
  };
  if (clientServiceId) body.ClientServiceId = Number(clientServiceId);

  const doCall = async () =>
    mbFetch("/class/addclienttoclass", { method: "POST", token, body });

  let res = await doCall();

  // If the cached token rotted (unlikely within 6 days, but possible if Don
  // changed roles), refresh once and retry.
  if (res.status === 401) {
    await getStaffToken({ forceRefresh: true });
    res = await doCall();
  }

  if (res.ok) {
    const visit = Array.isArray(res.body.Visit) ? res.body.Visit[0] : res.body.Visit;
    if (visit && (visit.Action || visit.ClassId || visit.Id)) {
      return { ok: true, visit, raw: res.body };
    }
  }
  return mapBookingError(res);
}

// ---- token cache testing aid (not exported by default) ---------------------

export function _resetTokenCacheForTests() {
  tokenCache.clear();
}
