# Schedule Story Spot-Check — 2026-07-27

## Run Info
- **UTC:** 2026-07-27T12:20:45Z
- **ET:** 2026-07-27 08:20 EDT

## Calendar Entry
- **ID checked:** `2026-07-27-schedule`
- **Status:** ❌ MISSING — no entry found in `content-calendar/calendar.json`

## IG Verification
- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** 403 Forbidden (login wall) — inconclusive, cannot verify via public fetch

## Verdict: 🚨 ACTION_NEEDED

Today's schedule story entry is absent from the calendar and the Mac mini cron did not produce a posted record. The IG public profile is behind a login wall so direct story verification is not possible.

**Joey must fire manually from the Mac:**
```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
