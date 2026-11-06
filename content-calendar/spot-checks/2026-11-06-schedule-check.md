# Schedule Story Spot-Check — 2026-11-06

**Run time:** 2026-11-06 12:06 UTC / 07:06 ET

---

## Calendar Entry

- **Expected ID:** `2026-11-06-schedule`
- **Status:** MISSING — no entry found in `content-calendar/calendar.json`
- **Note:** Last schedule entry in calendar is `2026-04-28-schedule` (posted). No schedule posts have been logged in over 6 months.

## IG Verification

- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** BLOCKED — `www.instagram.com` is outside this cloud session's allowed network domains. Unable to verify via live fetch.

## Verdict

**🚨 ACTION_NEEDED**

No `2026-11-06-schedule` entry in `calendar.json`. IG verification inconclusive (network blocked). Mac mini cron has not updated the calendar since late April 2026. Manual intervention required.

---

## Action

Fire from your Mac:

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
