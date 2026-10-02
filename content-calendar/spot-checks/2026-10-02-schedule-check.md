# Schedule Story Spot-Check — 2026-10-02

**Run time:** 2026-10-02 12:14 UTC / 08:14 ET

---

## Calendar Entry

- **Expected ID:** `2026-10-02-schedule`
- **Status:** ❌ MISSING — no entry found in `content-calendar/calendar.json`
- **Last schedule entry in calendar:** `2026-04-28` (status: posted)
- **Gap:** ~157 days with no schedule story logged — the Mac mini cron has not been writing to calendar.json since late April 2026.

## IG Live Check

- **URL:** `https://www.instagram.com/dbelitefitness/`
- **Result:** Blocked by network egress proxy — **inconclusive**
- Stories are not reliably visible on public profile pages regardless; calendar.json is the primary signal.

## Verdict

### 🚨 ACTION_NEEDED

The schedule story for 2026-10-02 is **missing** from the calendar. Given the 157-day gap in schedule entries, the Mac mini cron (`scripts/run-daily-schedule.mjs`) has likely been failing silently since approximately late April 2026 — possibly after an OS update, sleep policy change, or dependency break.

**Immediate action:** Fire manually from the Mac:
```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

**Follow-up:** Investigate the Mac mini cron. Check:
- `crontab -l` on the Mac mini to confirm the job is still registered
- `cron/heartbeat.json` for last recorded run
- Console logs for `run-daily-schedule.mjs` failures around late April 2026
- Whether Upload-Post API key or MindBody token has expired
