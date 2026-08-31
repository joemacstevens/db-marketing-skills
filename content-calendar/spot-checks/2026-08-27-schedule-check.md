# Schedule Story Spot-Check — 2026-08-27

| Field | Value |
|---|---|
| Run timestamp (UTC) | 2026-08-27T12:27:46Z |
| Run timestamp (ET) | 2026-08-27 08:27:46 EDT |
| Check date | 2026-08-27 |

## Calendar Entry

- **ID checked:** `2026-08-27-schedule`
- **Status:** MISSING — no entry found in `content-calendar/calendar.json`
- **Last schedule entry:** `2026-04-28-schedule` (status: posted) — over 4 months ago

## IG Verification

- **URL:** https://www.instagram.com/dbelitefitness/
- **Result:** BLOCKED — egress proxy blocked the request; unable to verify live story status

## Verdict

**ACTION_NEEDED**

No schedule story entry exists in `calendar.json` for today (2026-08-27). The Mac mini cron has not posted or logged the story. IG fetch was inconclusive due to proxy restrictions.

Joey must fire the daily schedule script manually from the Mac mini.

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
