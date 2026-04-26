# Leads — the Different Breed CRM layer

This directory is to leads what `content-calendar/` is to posts: a single JSON state file plus the tools that read and write to it.

## Files

- `leads.json` — central state. Every lead, every status change, every history entry. Mirrors the `calendar.json` shape on purpose.
- `schema.json` — the contract for `leads.json`. Update this when fields change.
- `sequences/` — Resend-ready email sequences (markdown with frontmatter), keyed off lead status + tags.
- `integrations/` — per-channel notes for how leads land here (Manychat, Vercel form, walk-in form).

## Channels

| Channel | How it lands in leads.json |
|---|---|
| Form (camp / class landing pages) | `landing-page/<page>/api/register.js` POSTs to `leads/ingest-form.mjs` (TBD), which dedupes by email and appends. |
| Manychat (IG DM) | Manychat Pro AI webhook → `leads/integrations/manychat.md` documents the payload → `leads/ingest-dm.mjs` (TBD) appends. |
| Walk-in / referral | Joey tells Claude → Claude appends via `skills/lead-capture.md`. |

## Status flow

`new → contacted → trial-booked → enrolled` (or `lost`)

`enrolled` is the handoff — once they're in MindBody, MindBody is the source of truth for their membership state, and we stop tracking them here.

## Approval gate

Same as posts. Claude drafts every outbound email, Joey approves, then it sends via the `db-email-kit` on the Mac mini at `~/.openclaw/workspace/db-email-kit`. Nothing leaves the building without explicit go-ahead.

## What's NOT here yet (Phase D)

- `ingest-form.mjs` — the Vercel form handler updates need to write here. Open question for Joey: where does the write happen? (See AI-OS-REORG-PLAN.md §8 Q1.)
- `ingest-dm.mjs` — Manychat webhook receiver.
- Real sequences — only one placeholder is in `sequences/` today.
- Backfill script — pull historical Don-notification emails into leads.json so we start with real data.
