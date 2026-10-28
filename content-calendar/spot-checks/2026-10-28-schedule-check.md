# Schedule Story Spot-Check — 2026-10-28

## Run Info
- **UTC:** 2026-10-28 12:05 UTC
- **ET:**  2026-10-28 08:05 EDT

## Calendar Check
- **Entry sought:** `id == "2026-10-28-schedule"` with `content_type == "schedule"`
- **Result:** ❌ Entry **missing** from `content-calendar/calendar.json`

The Mac mini cron (12:01 AM ET daily) did not write a `posted` entry for today's schedule story.

## IG Verification
- **Attempted:** `https://www.instagram.com/dbelitefitness/`
- **Result:** DNS resolution blocked by cloud session network policy — unable to verify live stories.

## Verdict

> **ACTION_NEEDED**

Today's schedule story has not posted and the calendar entry is absent. Fire manually from your Mac.

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
