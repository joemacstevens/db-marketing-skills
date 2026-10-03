# Schedule Story Spot-Check — 2026-10-03

**Run time:** 2026-10-03 12:14 UTC / 08:14 ET

---

## Calendar Entry

- **Expected ID:** `2026-10-03-schedule`
- **Status:** ❌ MISSING — no entry found in `content-calendar/calendar.json`
- **Last schedule entry in calendar:** `2026-04-28` (status: posted)
- **Gap:** ~158 days with no schedule story logged — the Mac mini cron has not been writing to calendar.json since late April 2026.

## IG Live Check

- **URL:** `https://www.instagram.com/dbelitefitness/`
- **Result:** Blocked by network egress proxy — **inconclusive**
- Stories are not reliably visible on public profile pages regardless; calendar.json is the primary signal.

## Verdict

### 🚨 ACTION_NEEDED

The schedule story for 2026-10-03 is **missing** from the calendar. This is the 158th consecutive day with no schedule entry — the Mac mini cron (`scripts/run-daily-schedule.mjs`) has been failing silently since approximately late April 2026.

**Immediate action:** Fire manually from the Mac:
```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

**Reminder — cron investigation checklist:**
- `crontab -l` on the Mac mini to confirm job is registered
- Check `cron/heartbeat.json` for last recorded run
- Review Console logs for `run-daily-schedule.mjs` failures around late April 2026
- Verify Upload-Post API key and MindBody staff token have not expired
