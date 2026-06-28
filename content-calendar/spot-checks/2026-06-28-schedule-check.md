# Schedule Story Spot-Check — 2026-06-28

**Run:** 2026-06-28 12:03 UTC / 08:03 ET

---

## Calendar Entry

- **Expected ID:** `2026-06-28-schedule`
- **Status:** MISSING — no entry found in `content-calendar/calendar.json`
- **Most recent schedule entry in calendar:** `2026-04-25-schedule` (status: posted)
- **Gap:** ~64 days of schedule entries absent from calendar.json

## Instagram Verification

- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — login wall / bot-block. Unable to verify story presence.

## Verdict

**ACTION_NEEDED**

The Mac mini cron has not written any schedule entries to calendar.json since 2026-04-25. The daily story pipeline (`scripts/run-daily-schedule.mjs`) has been silently failing for ~64 consecutive days. Instagram is inaccessible for automated verification.

Joey must fire the script manually from the Mac mini and investigate the cron failure.

---

**Manual fire command:**
```
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
