# Schedule Story Spot-Check — 2026-07-09

## Run Timestamps
- **UTC:** Thu Jul  9 12:12 UTC 2026
- **ET:**  Thu Jul  9 08:12 EDT 2026

## Calendar Entry Check
- **Looking for:** `id == "2026-07-09-schedule"` with `content_type == "schedule"`
- **Result:** ❌ Entry NOT FOUND in `content-calendar/calendar.json`

## Instagram Verification
- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — login wall. Unable to verify story presence from cloud env.
- **Conclusion:** Inconclusive (login required).

## Verdict: 🚨 ACTION_NEEDED

The calendar has no `2026-07-09-schedule` entry with `status == "posted"`, and the IG profile is behind a login wall so live verification is not possible. The Mac mini cron (12:01 AM ET) appears to have **not run or not logged the result**.

**Joey must fire manually from the Mac:**
```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
