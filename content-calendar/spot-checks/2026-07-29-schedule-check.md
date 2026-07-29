# Schedule Story Spot-Check — 2026-07-29

## Run Info
- **UTC:** 2026-07-29T12:14:24Z
- **ET:** 2026-07-29 08:14:24 EDT

## Calendar Entry
- **Looking for:** `id = "2026-07-29-schedule"`, `content_type = "schedule"`
- **Status:** MISSING — no entry found in `content-calendar/calendar.json`
- **Last known posted schedule:** `2026-04-25-schedule` (95 days ago)

## IG Verification
- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — login wall, content not accessible
- **Conclusion:** Unable to verify via public IG profile

## Verdict: ACTION_NEEDED

The calendar has no entry for today's schedule story, and the most recent `schedule` post in calendar.json is from **2026-04-25** — a 95-day gap. The Mac mini cron (`scripts/run-daily-schedule.mjs`) does not appear to have run or written back to the calendar since late April.

## Required Action
Fire the daily schedule script manually from your Mac:
```
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

Also consider investigating why the Mac mini cron has stopped updating `content-calendar/calendar.json`.
