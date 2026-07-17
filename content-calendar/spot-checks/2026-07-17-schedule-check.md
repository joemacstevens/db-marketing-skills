# Schedule Story Spot-Check — 2026-07-17

**Run timestamp:** 2026-07-17 12:11 UTC / 08:11 EDT

---

## Calendar Entry Status

**MISSING** — No entry with `id == "2026-07-17-schedule"` found in `content-calendar/calendar.json`.

Latest schedule entries in the calendar stop at `2026-04-25-schedule`. The calendar has not been updated since then (20 total posts indexed).

---

## Instagram Verification

- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — login wall / access denied from cloud environment
- **Conclusion:** Inconclusive — cannot confirm or deny a story was posted via public fetch

---

## Verdict: `ACTION_NEEDED`

The calendar has no record of today's schedule story being posted, and the calendar has not been updated since late April 2026. The Mac mini cron (`scripts/run-daily-schedule.mjs`) appears to have been failing silently.

**Joey must fire manually from the Mac:**
```bash
cd "/Users/joestevens/Projects/Different Breed"
node scripts/run-daily-schedule.mjs
```

Also worth checking: `cron/heartbeat.json` on the Mac mini to see when the cron last ran successfully.
