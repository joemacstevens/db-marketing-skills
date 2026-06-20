# Schedule Story Spot-Check — 2026-06-20

## Run Timestamps
- **UTC:** 2026-06-20 12:03:04 UTC
- **ET:**  2026-06-20 08:03:04 EDT

## Calendar Entry
- **ID checked:** `2026-06-20-schedule`
- **Result:** MISSING — no entry found in `content-calendar/calendar.json` with this ID and `content_type == "schedule"`
- Total schedule posts in calendar: 5 (none dated 2026-06-20)

## IG Verification
- **URL:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — login wall, unable to verify story presence
- **Conclusion:** INCONCLUSIVE (calendar.json is primary signal)

## Verdict
**🚨 ACTION_NEEDED**

The cron at `/Users/noahajeo/...` did not post today's schedule story. No `2026-06-20-schedule` entry exists in calendar.json with status `posted`. Fire manually from your Mac:

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

> **Note:** This has been ACTION_NEEDED on every check since at least 2026-06-19. The Mac mini cron appears to be persistently broken — consider diagnosing `scripts/run-daily-schedule.mjs` or the cron configuration at `/Users/noahajeo/...`.
