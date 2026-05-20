# Schedule Story Spot-Check — 2026-05-20

| Field | Value |
|---|---|
| Run timestamp (UTC) | 2026-05-20T12:05:58Z |
| Run timestamp (ET) | 2026-05-20 08:05 AM EDT |
| Date checked | 2026-05-20 |

## Calendar Entry

- **File:** `content-calendar/calendar.json` — **FILE DOES NOT EXIST**
- **Expected entry:** `2026-05-20-schedule` (`content_type: schedule`, `status: posted`)
- **Status:** MISSING — calendar.json is absent entirely; no posted record found

## Instagram Verification

- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 Forbidden (login wall) — inconclusive

## Verdict

**ACTION_NEEDED**

`calendar.json` does not exist in the repo. The cron job at `/Users/noahajeo/...` has likely been failing silently. No evidence today's schedule story was posted.

**Joey — fire manually from your Mac:**
```
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
