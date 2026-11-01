# Schedule Story Spot-Check — 2026-11-01

**Run timestamp:** 2026-11-01 12:05 UTC / 07:05 ET

---

## Calendar Entry Status

- **Looked for:** `id == "2026-11-01-schedule"` with `content_type == "schedule"`
- **Result:** **MISSING** — no entry found in `content-calendar/calendar.json`

## IG Verification

- **URL attempted:** `https://www.instagram.com/dbelitefitness/`
- **Result:** Host unreachable from this cloud environment (outside allowed network domains). Unable to verify.

## Verdict: ACTION_NEEDED

The `2026-11-01-schedule` post is absent from the content calendar. The Mac mini cron (`scripts/run-daily-schedule.mjs`) did not run or did not write the calendar entry for today.

**Joey — fire manually from your Mac:**

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
