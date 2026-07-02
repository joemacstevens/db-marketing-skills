# Schedule Story Spot-Check — 2026-07-02

## Run Timestamps
- **UTC:** 2026-07-02 12:10:59 UTC
- **ET:** 2026-07-02 08:10:59 EDT

## Calendar Entry Status
- **Looking for:** `id == "2026-07-02-schedule"`, `content_type == "schedule"`
- **Result:** **MISSING** — no entry found in `content-calendar/calendar.json`
- **Last successful schedule post on record:** `2026-04-25-schedule` (status: posted, ~68 days ago)

## Instagram Verification
- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — login wall; cannot verify story presence from this environment
- **Conclusion:** Inconclusive (login required)

## Verdict: `ACTION_NEEDED`

The Mac mini cron (`scripts/run-daily-schedule.mjs`) has not posted today's schedule story and has no calendar entry to show it ran. The last confirmed post is over 2 months old. Manual intervention required.

---

**To fire manually from your Mac:**
```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
