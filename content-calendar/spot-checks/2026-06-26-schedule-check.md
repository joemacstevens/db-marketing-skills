# Schedule Story Spot-Check — 2026-06-26

## Run Info
- **UTC:** Fri Jun 26 12:03:57 UTC 2026
- **ET:**  Fri Jun 26 08:03:57 EDT 2026

## Calendar Entry Check
- **Target ID:** `2026-06-26-schedule`
- **Status:** MISSING — no entry found in `content-calendar/calendar.json`
- **Last known schedule post:** `2026-04-25-schedule` (status: `posted`)
- **Gap:** ~62 days of missing daily schedule stories (2026-04-26 through 2026-06-26)

## Instagram Verification
- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — login wall, content not accessible
- **Conclusion:** Unable to verify — treat as inconclusive

## Verdict: `ACTION_NEEDED`

The Mac mini cron (`scripts/run-daily-schedule.mjs`) has not posted a schedule story since **April 25, 2026**. No calendar entry exists for today.

**Joey: fire manually from your Mac:**
```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

The cron itself needs investigation — it has been silently failing for ~2 months.
