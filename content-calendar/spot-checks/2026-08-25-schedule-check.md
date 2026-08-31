# Schedule Story Spot-Check — 2026-08-25

## Run Info
- **UTC:** 2026-08-25T12:23:01Z
- **ET:** 2026-08-25 08:23:01 EDT
- **Checker:** Automated cloud session (fallback alarm)

## Calendar Entry Check
- **Looking for:** `id = "2026-08-25-schedule"`, `content_type = "schedule"`
- **Result:** **NOT FOUND**
- No entry exists in `content-calendar/calendar.json` for today's schedule story.

## IG Verification
- **URL:** https://www.instagram.com/dbelitefitness/
- **Result:** **BLOCKED** — network egress proxy prevents access from this cloud environment.
- IG check is inconclusive; calendar.json is the primary signal.

## Verdict

🚨 **ACTION_NEEDED**

The `2026-08-25-schedule` entry is absent from `calendar.json`. The Mac mini cron (12:01 AM ET) either did not fire or failed silently. The story has not been logged as posted.

**Joey: fire it manually from your Mac:**

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
