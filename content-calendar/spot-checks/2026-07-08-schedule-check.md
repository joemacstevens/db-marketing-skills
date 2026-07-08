# Schedule Story Spot-Check — 2026-07-08

## Run Info
- **UTC:** 2026-07-08T12:11:38Z
- **ET:** 2026-07-08T08:11:38 EDT

## Calendar Entry
- **ID checked:** `2026-07-08-schedule`
- **Status:** **MISSING** — no entry with this ID found in `content-calendar/calendar.json`

## IG Verification
- **URL fetched:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — login wall; public profile not accessible from this cloud environment
- **Conclusion:** Inconclusive (cannot confirm or deny story posted via IG)

## Verdict: `ACTION_NEEDED`

No `2026-07-08-schedule` entry exists in the calendar. The Mac mini cron that runs `scripts/run-daily-schedule.mjs` at 12:01 AM ET did not write a `posted` record for today. IG could not be independently verified due to login wall.

**Joey: fire manually from your Mac:**
```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
