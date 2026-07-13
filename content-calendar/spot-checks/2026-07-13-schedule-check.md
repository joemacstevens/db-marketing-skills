# Schedule Story Spot-Check — 2026-07-13

**Run time:** 2026-07-13 12:12 UTC / 08:12 ET

---

## Calendar Entry

- **Looking for:** `id == "2026-07-13-schedule"`, `content_type == "schedule"`
- **Result:** Entry **MISSING** — no matching record in `content-calendar/calendar.json`

## Instagram Verification

- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — login wall; public scrape not possible
- **Conclusion:** Inconclusive (cannot confirm or deny via public fetch)

## Verdict

**ACTION_NEEDED**

The calendar has no `2026-07-13-schedule` entry and Instagram is behind a login wall. The Mac mini cron (12:01 AM ET) did not log a successful post. Joey must fire the schedule story manually.

---

**Manual fire command:**
```bash
cd "/Users/noahajeo/Projects/schedule-render-postschedule" && node scripts/run-daily-schedule.mjs
```
