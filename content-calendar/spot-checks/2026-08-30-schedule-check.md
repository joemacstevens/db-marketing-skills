# Schedule Story Spot-Check — 2026-08-30

## Run Info
- **UTC:** 2026-08-30 12:13 UTC
- **ET:** 2026-08-30 08:13 EDT

## Calendar Check
- **Entry sought:** `id == "2026-08-30-schedule"`, `content_type == "schedule"`
- **Result:** MISSING — no entry found for today
- **Most recent schedule post in calendar:** `2026-04-28-schedule` (status: `posted`)
- **Calendar last_updated:** `2026-08-03T16:14:46.008Z`

The cron has not filed any schedule posts to `calendar.json` since late April 2026. This is an ongoing failure spanning 4+ months.

## IG Verification
- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** BLOCKED — network egress proxy blocked access to instagram.com. Cannot verify live.

## Verdict

**ACTION_NEEDED**

The schedule cron has been silently failing to log posts to `calendar.json` since late April 2026. Today's story (`2026-08-30-schedule`) is absent from the calendar and cannot be confirmed live via IG due to network restrictions.

Joey must fire the schedule story manually from the Mac mini:

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
