# Schedule Story Spot-Check — 2026-07-30

**Run timestamp:** 2026-07-30 12:13 UTC / 08:13 ET

---

## Calendar Entry Status

- **Looking for:** `id == "2026-07-30-schedule"`, `content_type == "schedule"`
- **Result:** **MISSING** — no entry found in `content-calendar/calendar.json`
- **Last schedule entry on record:** `2026-04-25-schedule` (status: posted)
- **Gap:** 96 days with no schedule stories logged — Mac mini cron has been failing silently since late April

## IG Verification

- **URL checked:** `https://www.instagram.com/dbelitefitness/`
- **Result:** HTTP 403 — login wall, public profile not accessible from this cloud env
- **Verdict:** Inconclusive (cannot confirm or deny a story posted today)

## Verdict

**ACTION_NEEDED**

The calendar has no entry for today's schedule story, and the pattern of missing entries stretches back to 2026-04-25. The Mac mini cron (`scripts/run-daily-schedule.mjs`) has not been writing results back to calendar.json — meaning it has either been failing silently or not running at all for ~3 months.

### Recommended immediate action

Fire manually from the Mac:
```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

### Recommended follow-up

1. Check Mac mini cron logs: `crontab -l` and `grep CRON /var/log/syslog` (or `log show --predicate 'process == "cron"' --last 1d`)
2. Verify `cron/heartbeat.json` is being updated — if not, the heartbeat write step in the script is also broken
3. Re-check `content-calendar/calendar.json` after a successful manual run to confirm the script still appends correctly
