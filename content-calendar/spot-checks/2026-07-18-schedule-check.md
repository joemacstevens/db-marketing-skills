# Schedule Story Spot-Check — 2026-07-18

**Run:** 2026-07-18T12:11:00Z (08:11 AM ET)

## Calendar Entry

- **Expected ID:** `2026-07-18-schedule`
- **Status:** MISSING — no entry found in `content-calendar/calendar.json`
- Calendar's newest schedule entry is `2026-04-25-schedule` (entries have not been added since late April)

## IG Verification

- **URL:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — Instagram blocked the unauthenticated fetch (bot wall). Unable to verify via public profile.

## Verdict

**ACTION_NEEDED**

The Mac mini cron has not been updating `calendar.json` with today's schedule entry (missing since 2026-04-25), and IG verification is inconclusive due to login wall. Joey must fire the schedule story manually from the Mac.

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
