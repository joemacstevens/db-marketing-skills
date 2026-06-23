# Schedule Story Spot-Check — 2026-06-23

**Run time:** 2026-06-23 12:04 UTC / 08:04 EDT

---

## Calendar Entry

- **Entry ID checked:** `2026-06-23-schedule`
- **Result:** MISSING — no entry found in `content-calendar/calendar.json`
- **Last schedule post in calendar:** `2026-04-25-schedule` (status: posted) — 59 days ago

## IG Verification

- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 Forbidden (login wall) — inconclusive

## Verdict

**ACTION_NEEDED**

The Mac mini cron (`scripts/run-daily-schedule.mjs`) has not produced a posted calendar entry since April 25. The cron appears to have been silently failing for ~59 days.

## Manual Fix

```bash
cd "/Users/joestevens/Projects/Different Breed"
node scripts/run-daily-schedule.mjs
```

Run from your Mac to post today's story manually.
