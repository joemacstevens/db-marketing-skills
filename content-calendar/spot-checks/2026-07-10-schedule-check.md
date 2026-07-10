# Schedule Story Spot-Check — 2026-07-10

## Run Timestamps
- **UTC:** Fri Jul 10 12:24 UTC 2026
- **ET:**  Fri Jul 10 08:24 EDT 2026

## Calendar Entry Check
- **Looking for:** `id == "2026-07-10-schedule"` with `content_type == "schedule"`
- **Result:** ❌ Entry NOT FOUND in `content-calendar/calendar.json`
- **Last schedule entry found:** `2026-04-25-schedule` (status: posted) — **76 days ago**

## Instagram Verification
- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — login wall. Unable to verify story presence from cloud env.
- **Conclusion:** Inconclusive (login required).

## Pattern Note
Spot-checks for 2026-07-05 through 2026-07-09 all returned the same result: entry not found, cron not running. This is an ongoing failure, not a one-day miss.

## Verdict: 🚨 ACTION_NEEDED

The calendar has no `2026-07-10-schedule` entry with `status == "posted"`. The Mac mini cron (12:01 AM ET) has not posted a schedule story since **April 25, 2026** — 76 consecutive misses. Immediate action required.

**Joey must fire manually from the Mac:**
```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

**Then investigate the cron:** Check `cron/heartbeat.json` and the Mac mini cron logs to find why the job stopped running after April 25.
