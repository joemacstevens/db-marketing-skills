# Schedule Story Spot-Check — 2026-07-20

| Field | Value |
|---|---|
| Run timestamp (UTC) | 2026-07-20 12:13 UTC |
| Run timestamp (ET) | 2026-07-20 08:13 EDT |
| Checked by | Automated fallback alarm (Claude Code — cloud env) |

## Calendar Entry

- **Post ID checked:** `2026-07-20-schedule`
- **Result:** **MISSING** — no entry with this ID found in `content-calendar/calendar.json`
- **Note:** Calendar `last_updated` is `2026-04-25T04:05:07.525Z` — the cron has not written a schedule entry since at least late April. Most recent schedule entry in calendar is `2026-04-21-schedule` (status: posted).

## Instagram Verification

- **URL checked:** `https://www.instagram.com/dbelitefitness/`
- **Result:** HTTP 403 — login wall hit; unable to verify whether a story was manually posted outside the calendar pipeline.
- **Conclusion:** Inconclusive (cannot confirm or deny via public IG fetch)

## Verdict

**🚨 ACTION_NEEDED**

The calendar has no `2026-07-20-schedule` entry with `status=posted`. The Mac mini cron (`scripts/run-daily-schedule.mjs`) has been failing silently — the last schedule post in the calendar was **2026-04-21** (nearly 3 months ago). IG could not be verified due to login wall.

### To fire manually from your Mac

```bash
cd "/Users/noahajeo/Projects/schedule-render-postschedule"
node scripts/run-daily-schedule.mjs
```

Or from the DB repo root:

```bash
cd "/Users/joestevens/Projects/Different Breed"
node scripts/run-daily-schedule.mjs
```
