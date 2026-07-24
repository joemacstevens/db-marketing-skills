# Schedule Story Spot-Check — 2026-07-24

**Run time:** 2026-07-24 12:14 UTC / 08:14 EDT

---

## Calendar Entry

- **ID checked:** `2026-07-24-schedule`
- **Result:** MISSING — no entry with this ID and `content_type == "schedule"` exists in `content-calendar/calendar.json`

## IG Verification

- **URL:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — login wall, unable to verify live stories from this environment

## Verdict: ACTION_NEEDED

The calendar has no record of today's schedule story being posted or even queued. The Mac mini cron (`scripts/run-daily-schedule.mjs`, 12:01 AM ET) appears to have missed today's run.

**Joey: fire manually from your Mac:**
```
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

---

*Automated check by Claude Code scheduled task.*
