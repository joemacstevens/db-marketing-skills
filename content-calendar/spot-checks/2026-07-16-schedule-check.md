# Schedule Story Spot-Check — 2026-07-16

## Run Timestamps
- **UTC:** 2026-07-16 12:11 UTC
- **ET:**  2026-07-16 08:11 EDT

## Calendar Entry
- **Looking for:** `id = "2026-07-16-schedule"`, `content_type = "schedule"`
- **Result:** MISSING — no matching entry found in `content-calendar/calendar.json`

## Instagram Verification
- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — login wall. Cannot verify story presence from this environment.
- **Assessment:** Inconclusive (login required; calendar.json is primary signal)

## Verdict

**ACTION_NEEDED**

The calendar entry for today's schedule story is absent, which means the Mac mini cron either did not run or did not write back to `calendar.json` after posting. Instagram could not be verified independently due to the login wall.

**Joey: fire manually from your Mac:**
```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
