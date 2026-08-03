# Schedule Story Spot-Check — 2026-08-03

**Run time:** 2026-08-03 12:22 UTC / 08:22 EDT

---

## Calendar Entry

- **Expected ID:** `2026-08-03-schedule`
- **Status:** MISSING — no entry found in `content-calendar/calendar.json`
- **Last schedule entry in calendar:** `2026-04-25-schedule` (status: `posted`)
- **Calendar last_updated:** `2026-04-25T04:05:07.525Z`
- **Gap:** ~100 days without a schedule story entry — cron has been silently failing since late April 2026

## IG Verification

- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — login wall, content not accessible without authentication
- **Conclusion:** Unable to verify via public profile

## Verdict

**ACTION_NEEDED**

The Mac mini cron (`scripts/run-daily-schedule.mjs`) has not successfully posted a schedule story since 2026-04-25. No calendar entry exists for today, and the IG profile could not be verified due to a login wall.

---

## Action Required

Fire the schedule script manually from your Mac:

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

Then investigate why the cron has been failing since April 25. Common causes:
- Cron not running (Mac mini sleep / cron disabled)
- MindBody or Upload-Post token expired
- `scripts/run-daily-schedule.mjs` throwing an unhandled error with no alert
