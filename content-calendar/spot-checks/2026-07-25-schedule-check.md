# Schedule Story Spot-Check — 2026-07-25

**Run timestamp:** 2026-07-25 12:11 UTC / 08:11 EDT

---

## Calendar Entry Status

**Entry ID:** `2026-07-25-schedule`
**Result:** MISSING — no entry found in `content-calendar/calendar.json` with `id == "2026-07-25-schedule"` and `content_type == "schedule"`.

---

## IG Verification

**URL checked:** https://www.instagram.com/dbelitefitness/
**Result:** HTTP 403 Forbidden (login wall) — unable to verify whether a story was manually posted outside the automated pipeline. Inconclusive.

---

## Verdict: ACTION_NEEDED

The calendar.json entry for today's schedule story is missing, and IG verification is blocked by a login wall. The Mac mini cron either did not run or failed silently again.

**Joey must fire manually from his Mac:**
```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
