# Schedule Story Spot-Check — 2026-06-07

| Field | Value |
|-------|-------|
| Run (UTC) | 2026-06-07T12:08:48Z |
| Run (ET)  | 2026-06-07T08:08:48 EDT |
| Date checked | 2026-06-07 |

## Calendar Entry

**Status: MISSING**

`content-calendar/calendar.json` does not exist in the repository. No entry with `id == "2026-06-07-schedule"` and `content_type == "schedule"` could be found.

## Instagram Verification

- URL checked: `https://www.instagram.com/dbelitefitness/`
- Result: **HTTP 403 Forbidden** (login wall / access denied)
- Verdict: **Inconclusive** — cannot confirm or deny a story was posted via public fetch.

## Verdict

> **ACTION_NEEDED**

The calendar has no record of today's schedule story being posted, and the IG profile is not publicly accessible for verification. The cron job on the Mac mini (`scripts/run-daily-schedule.mjs`) should be treated as having not run until confirmed otherwise.

**Joey — fire manually from your Mac:**

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
