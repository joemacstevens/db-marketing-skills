# Schedule Story Spot-Check — 2026-06-27

**Run:** 2026-06-27 12:03 UTC / 08:03 ET

---

## Calendar Entry

- **Expected ID:** `2026-06-27-schedule`
- **Status:** MISSING — no entry found in `content-calendar/calendar.json`
- **Most recent schedule entry in calendar:** `2026-04-25-schedule` (status: posted)
- **Gap:** ~63 days of schedule entries are absent from calendar.json

## Instagram Verification

- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — login wall / bot-block. Unable to verify story presence.

## Verdict

**ACTION_NEEDED**

The Mac mini cron has not written any schedule entries to calendar.json since 2026-04-25. The daily story pipeline (`scripts/run-daily-schedule.mjs`) appears to have been silently failing for ~63 days. Instagram is inaccessible for automated verification.

Joey must fire the script manually from the Mac mini and investigate why the cron stopped updating calendar.json.

---

**Manual fire command:**
```
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
