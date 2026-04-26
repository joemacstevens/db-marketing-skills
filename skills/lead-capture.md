# Skill: Lead Capture

**Status:** STUB. Scaffold built (2026-04-26 Phase A), full implementation in Phase D.

## Purpose

Get every Different Breed lead into one place — `leads/leads.json` — regardless of which channel it came from.

## State file

`leads/leads.json` (schema in `leads/schema.json`). Status flow: `new → contacted → trial-booked → enrolled` (or `lost`).

## Sources

| Source | How it gets here |
|---|---|
| `form` | Vercel landing-page form handler appends. Stub: `leads/ingest-form.mjs` (Phase D). |
| `manychat` | Manychat Pro flow → External Request webhook → ingestor appends. Stub: `leads/integrations/manychat.md` + `leads/ingest-dm.mjs` (Phase D). |
| `walk-in`, `referral`, `phone` | Joey tells Claude → Claude appends manually using this skill. |

## Manual ingestion (works today)

Joey says: "Add a lead — Sarah Cohen, mom, son Eli is 12, interested in camp full block, phone 555-0199, came from a walk-in this morning."

Claude does:
1. Read current `leads/leads.json`.
2. Generate next id (`yyyy-mm-dd-NNN`).
3. Append a lead object matching `leads/schema.json` with `source: "walk-in"`, `status: "new"`, `captured_at: now`, history with one `captured` entry.
4. Update `last_updated` at the top of the file.
5. Confirm to Joey: "Added lead {id} — Sarah Cohen, walk-in, status=new."

## Dedupe

Before appending, check existing leads by (a) phone, (b) email. If a match exists with status ≠ `lost`, append a history entry to the existing lead instead of creating a new one.

## Phase D additions

- `leads/ingest-form.mjs` — receives Vercel form POST, appends.
- `leads/ingest-dm.mjs` — receives Manychat webhook, appends.
- Backfill script for historical Don-notification emails.
