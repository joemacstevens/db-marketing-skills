// Vercel serverless function — DB Summer Camp 2026 registration
//
// Flow:
//   1. Validate POST body
//   2. Mint MindBody staff UserToken
//   3. Find existing client by email or create one (parent as primary contact)
//   4. AddClientToEnrollment for the right ClassScheduleId based on package
//   5. On ANY failure → still email Don + log so we never lose a lead
//   6. Return JSON { ok, message }

const MB_BASE = 'https://api.mindbodyonline.com/public/v6';

const REQUIRED_FIELDS = [
  'parent_name',
  'parent_phone',
  'parent_email',
  'athlete_name',
  'athlete_age',
  'package',
];

const PACKAGE_LABELS = {
  full:   'Full Camp (9 Weeks) — $3,015',
  block:  '4-Week Block — $1,460',
  weekly: 'Weekly — $420/wk',
  daily:  'Daily (Multi-Day) — $84/day',
  dropin: 'Single Day Drop-In — $110',
};

// Maps the form's package value -> which MindBody enrollment to attach to.
// Block/Daily share enrollments with Full/Weekly until Don sets up dedicated ones.
function packageToEnrollmentId(pkg) {
  const FULL = process.env.MINDBODY_CAMP_FULL_ID;     // 791
  const WEEK = process.env.MINDBODY_CAMP_WEEKLY_ID;   // 792
  switch (pkg) {
    case 'full':   return FULL;
    case 'block':  return FULL;
    case 'weekly': return WEEK;
    case 'daily':  return WEEK;
    case 'dropin': return WEEK;
    default:       return null;
  }
}

function mbHeaders(token) {
  const h = {
    'Api-Key':      process.env.MINDBODY_API_KEY_DBE,
    'SiteId':       process.env.MINDBODY_SITE_ID,
    'Content-Type': 'application/json',
  };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function mbIssueToken() {
  const r = await fetch(`${MB_BASE}/usertoken/issue`, {
    method: 'POST',
    headers: mbHeaders(),
    body: JSON.stringify({
      Username: process.env.MINDBODY_STAFF_USER,
      Password: process.env.MINDBODY_STAFF_PASS,
    }),
  });
  if (!r.ok) throw new Error(`token ${r.status}: ${await r.text()}`);
  return (await r.json()).AccessToken;
}

async function mbFindClientByEmail(token, email) {
  const url = `${MB_BASE}/client/clients?SearchText=${encodeURIComponent(email)}&Limit=5`;
  const r = await fetch(url, { headers: mbHeaders(token) });
  if (!r.ok) throw new Error(`find ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return (data.Clients || []).find((c) => (c.Email || '').toLowerCase() === email.toLowerCase()) || null;
}

async function mbAddClient(token, lead) {
  // Parent is the primary contact. We stash the athlete info in Notes so Don
  // can see it in MindBody without us needing a related-client setup yet.
  const [firstName, ...rest] = lead.parent_name.split(' ');
  const lastName = rest.join(' ') || '(parent)';
  const body = {
    Client: {
      FirstName: firstName,
      LastName:  lastName,
      Email:     lead.parent_email,
      MobilePhone: lead.parent_phone,
      ReferredBy: 'Summer Camp Landing Page',
      Notes: [
        `SUMMER CAMP 2026 LEAD`,
        `Athlete: ${lead.athlete_name} (age ${lead.athlete_age})`,
        `Package: ${lead.package_label}`,
        lead.notes ? `Notes: ${lead.notes}` : '',
        `Source: ${lead.source}`,
      ].filter(Boolean).join('\n'),
      SendAccountEmails: true,
    },
  };
  const r = await fetch(`${MB_BASE}/client/addclient`, {
    method: 'POST',
    headers: mbHeaders(token),
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`addclient ${r.status}: ${await r.text()}`);
  return (await r.json()).Client;
}

async function mbAddClientToEnrollment(token, clientId, enrollmentId) {
  const body = {
    ClientId: String(clientId),
    ClassScheduleId: Number(enrollmentId),
    EnrollOpen: true,
    EnrollDateForward: false,
    Test: false,
    SendEmail: true,
    Waitlist: false,
  };
  const r = await fetch(`${MB_BASE}/enrollment/addclienttoenrollment`, {
    method: 'POST',
    headers: mbHeaders(token),
    body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`enroll ${r.status}: ${text}`);
  return JSON.parse(text);
}

async function emailDon(lead, mbResult, mbError) {
  const to  = process.env.LEAD_NOTIFY_EMAIL;
  const key = process.env.RESEND_API_KEY;
  if (!to || !key) return 'skipped (no LEAD_NOTIFY_EMAIL or RESEND_API_KEY)';
  const subject = `DB Summer Camp Lead — ${lead.athlete_name} (${lead.package_label})`;
  const text = [
    `New Summer Camp 2026 registration:`,
    ``,
    `Parent:  ${lead.parent_name}`,
    `Phone:   ${lead.parent_phone}`,
    `Email:   ${lead.parent_email}`,
    ``,
    `Athlete: ${lead.athlete_name} (age ${lead.athlete_age})`,
    `Package: ${lead.package_label}`,
    `Notes:   ${lead.notes || '(none)'}`,
    ``,
    mbError
      ? `MindBody status: FAILED — ${mbError}`
      : `MindBody status: OK — clientId ${mbResult?.clientId}, enrollmentId ${mbResult?.enrollmentId}`,
    ``,
    `Received: ${lead.receivedAt}`,
    `Source:   ${lead.source}`,
  ].join('\n');
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'DB Summer Camp <noreply@differentbreedsportsacademy.com>',
        to: [to],
        reply_to: lead.parent_email,
        subject,
        text,
      }),
    });
    return r.ok ? 'sent' : `failed: ${r.status}`;
  } catch (err) {
    return `error: ${err.message}`;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Honeypot
  if (body.website) return res.status(200).json({ ok: true, message: 'Thanks!' });

  const missing = REQUIRED_FIELDS.filter((f) => !body[f] || String(body[f]).trim() === '');
  if (missing.length) {
    return res.status(400).json({
      ok: false,
      message: `Missing required fields: ${missing.join(', ')}`,
    });
  }

  const lead = {
    receivedAt:    new Date().toISOString(),
    parent_name:   String(body.parent_name).trim(),
    parent_phone:  String(body.parent_phone).trim(),
    parent_email:  String(body.parent_email).trim(),
    athlete_name:  String(body.athlete_name).trim(),
    athlete_age:   String(body.athlete_age).trim(),
    package:       String(body.package).trim(),
    package_label: PACKAGE_LABELS[body.package] || body.package,
    notes:         body.notes ? String(body.notes).trim() : '',
    source:        'summer.differentbreedsportsacademy.com',
  };

  // ---- MindBody push -----------------------------------------------------------
  let mbResult = null;
  let mbError  = null;
  try {
    if (!process.env.MINDBODY_API_KEY_DBE) throw new Error('MINDBODY_API_KEY_DBE not set');
    const enrollmentId = packageToEnrollmentId(lead.package);
    if (!enrollmentId) throw new Error(`No MindBody enrollment mapped for package "${lead.package}"`);

    const token  = await mbIssueToken();
    let client   = await mbFindClientByEmail(token, lead.parent_email);
    if (!client) client = await mbAddClient(token, lead);
    const clientId = client.Id || client.UniqueId;

    const enroll = await mbAddClientToEnrollment(token, clientId, enrollmentId);
    mbResult = { clientId, enrollmentId, raw: enroll };
  } catch (err) {
    mbError = err.message;
  }

  // ---- Always email + log so a lead is never lost -----------------------------
  const emailStatus = await emailDon(lead, mbResult, mbError);
  console.log('[summer-camp-lead]', JSON.stringify({ lead, mbResult, mbError, emailStatus }));

  // Even if MindBody failed, we tell the user "you're in" and Don works the lead manually.
  return res.status(200).json({
    ok: true,
    message: "You're in. We'll text you within 24 hours to confirm your spot.",
    debug: body.debug ? { mbResult, mbError, emailStatus, env: {
      hasKey: !!process.env.MINDBODY_API_KEY_DBE,
      hasSite: !!process.env.MINDBODY_SITE_ID,
      hasUser: !!process.env.MINDBODY_STAFF_USER,
      hasPass: !!process.env.MINDBODY_STAFF_PASS,
      hasFull: !!process.env.MINDBODY_CAMP_FULL_ID,
      hasWeekly: !!process.env.MINDBODY_CAMP_WEEKLY_ID,
    }} : undefined,
  });
}
