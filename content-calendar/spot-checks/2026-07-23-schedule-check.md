# Schedule Story Spot-Check — 2026-07-23

## Run Timestamps
- **UTC:** 2026-07-23 12:13 UTC
- **ET:** 2026-07-23 08:13 EDT

## Calendar Entry Check
- **Looking for:** `id == "2026-07-23-schedule"` with `content_type == "schedule"` in `content-calendar/calendar.json`
- **Result:** ❌ **Entry missing** — no matching record found

## Instagram Verification
- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** 403 Forbidden (login wall) — unable to verify story presence directly
- **Conclusion:** Inconclusive (IG public fetch blocked; calendar.json is the primary signal)

## Verdict: 🚨 ACTION_NEEDED

The `2026-07-23-schedule` entry does not exist in `calendar.json`, indicating the Mac mini cron did **not** run successfully last night. The story has not been logged as posted.

**Joey — fire manually from your Mac:**
```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
