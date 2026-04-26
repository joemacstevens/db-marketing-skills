# Manychat → leads.json integration

Joey has a **Manychat Pro** account for Different Breed. It handles IG DMs (and FB Messenger if enabled).

## What we want

Every conversation that crosses a lead-qualification threshold (asks about pricing, schedule, signup, trial) should land in `leads/leads.json` automatically with `source: "manychat"` and the full Manychat conversation linked via `channel_ref`.

## How (Phase D — not built yet)

1. **Manychat side:** Build a flow that, when a tag like `dm-lead-camp` or `dm-lead-class` is set, fires an **External Request** action to a webhook we host.
2. **Our side:** A small endpoint (`leads/ingest-dm.mjs`, runs on the Mac mini or a Vercel function) receives the webhook payload, dedupes against `leads.json` by phone or Manychat subscriber id, appends a new lead.
3. **Two-way sync:** When `lead-followup.md` sends an email, it also tags the Manychat subscriber with the same status so the IG side stays in sync.

## Secrets

The Manychat Pro API key is stored as `MANYCHAT_API_KEY` in `.env.local` (gitignored — confirmed via `git check-ignore`). Read it from the env, never hard-code or paste into a tracked file.

```js
// usage shape
const key = process.env.MANYCHAT_API_KEY;
fetch("https://api.manychat.com/...", { headers: { Authorization: `Bearer ${key}` } });
```

## Still needed from Joey before Phase D

- **Subscriber field map:** which custom user fields in Manychat correspond to our schema (parent_name, parent_phone, athlete_name, athlete_age, interest).
- **Tagging convention:** which tag names trigger lead capture (`dm-lead-camp`, `dm-lead-pilates`, `dm-lead-kids-boxing`, etc.).
- **Webhook receiver location:** Vercel function under a landing page's `api/manychat-webhook.js`, or a node service on the Mac mini, or both.
- **Webhook secret:** Manychat lets you HMAC-sign outbound External Requests — store that as `MANYCHAT_WEBHOOK_SECRET` in the same `.env.local` once we set up the flow.

## References

- Manychat API docs: https://api.manychat.com (confirm current URL when wiring)
- Authorization header format: `Bearer <key>`

## Status

**Phase D foundation — built 2026-04-26.** Data layer is now in ManyChat. Flow + trigger build handed off to Codex (computer-use) — see `manychat-codex-build-instructions.md`. Webhook receiver location still owes.

### What's in ManyChat as of 2026-04-26

**Tags (13):**
- Process: `dm-lead`, `qualified`, `dm-source-comment`
- Interest: `interest-camp`, `interest-kids-boxing`, `interest-pilates`, `interest-adult-boxing`, `interest-general`
- Status: `status-new`, `status-contacted`, `status-trial-booked`, `status-enrolled`, `status-lost`

**Custom user fields (4):**
| Field | Type | Maps to schema |
|---|---|---|
| `athlete_name` | text | `athlete_name` |
| `athlete_age` | number | `athlete_age` |
| `interest` | text | `interest` (single value, schema is array — webhook will wrap) |
| `source_campaign` | text | `campaign` |

Built-in fields cover the rest: `first_name`/`last_name` → `parent_name`, `email` → `parent_email`, `phone` → `parent_phone`.

Raw API verification dumps in `leads/integrations/manychat-audit-raw/` (gitignored — may contain message copy).

### Status sync — bidirectional rule

`lead-followup.md` should apply the matching `status-*` tag in ManyChat whenever it changes a lead's `status` in `leads.json`. Use `POST /fb/subscriber/addTag` with the subscriber's MC id (stored in `channel_ref`) and the tag id from the appendix in `manychat-codex-build-instructions.md`.

### Still owed before Phase D ships

- Build IG comment trigger + lead capture flow (Codex handoff doc, in progress)
- `leads/ingest-dm.mjs` — webhook receiver
- Webhook External Request action wired into the flow's final node
- `MANYCHAT_WEBHOOK_SECRET` for HMAC signing
