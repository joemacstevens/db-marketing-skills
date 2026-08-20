# Schedule Story Spot-Check — 2026-08-20

**Run timestamp:** 2026-08-20T12:18:30Z (8:18 AM ET)

## Calendar Entry Status

- **Expected ID:** `2026-08-20-schedule`
- **Result:** MISSING — no entry with this ID found in `content-calendar/calendar.json`
- **Last schedule entry on record:** `2026-04-28-schedule` (status: posted) — approximately 4 months ago

## IG Verification

- **URL checked:** `https://www.instagram.com/dbelitefitness/`
- **Result:** BLOCKED — egress proxy blocks Instagram from this cloud environment. Cannot verify via live fetch.
- **Conclusion:** Inconclusive (IG unreachable)

## Verdict

**ACTION_NEEDED**

The calendar has no record of today's schedule story being posted. The Mac mini cron (`scripts/run-daily-schedule.mjs`, scheduled 12:01 AM ET) appears to have missed. Last successful auto-post was 2026-04-28 — the script has not been logging to `calendar.json` for ~4 months.

**Manual action required:** Fire the script from the Mac mini.
