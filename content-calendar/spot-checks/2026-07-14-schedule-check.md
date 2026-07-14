# Schedule Story Spot-Check — 2026-07-14

## Run Timestamps

- **UTC:** 2026-07-14 12:10 UTC
- **ET:** 2026-07-14 08:10 EDT

## Calendar Entry Status

- **Entry searched:** `2026-07-14-schedule` with `content_type == "schedule"`
- **Result:** Entry **MISSING** — no matching record in `content-calendar/calendar.json`
- **Note:** Calendar `last_updated` is `2026-04-25T04:05:07.525Z`. No entries exist after April 25. The Mac mini cron has not logged any schedule posts to the calendar since late April.

## Instagram Verification

- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — login wall; public scrape not possible
- **Conclusion:** Inconclusive (cannot confirm or deny via public fetch)

## Verdict

**ACTION_NEEDED**

The calendar has no `2026-07-14-schedule` entry and Instagram is behind a login wall. The Mac mini cron (12:01 AM ET) did not log a successful post. Joey must fire the schedule story manually.

---

**Manual fire command:**
```bash
cd "/Users/noahajeo/Projects/schedule-render-postschedule" && node scripts/run-daily-schedule.mjs
```
