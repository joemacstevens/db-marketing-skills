# Schedule Story Spot-Check — 2026-07-19

| Field | Value |
|---|---|
| Run timestamp (UTC) | 2026-07-19 12:11 UTC |
| Run timestamp (ET) | 2026-07-19 08:11 EDT |
| Checked by | Automated fallback alarm (Claude Code — cloud env) |

## Calendar Entry

- **Post ID checked:** `2026-07-19-schedule`
- **Result:** **MISSING** — no entry with this ID found in `content-calendar/calendar.json`

## Instagram Verification

- **URL checked:** `https://www.instagram.com/dbelitefitness/`
- **Result:** HTTP 403 — login wall hit; unable to verify whether a story was manually posted outside the calendar pipeline.
- **Conclusion:** Inconclusive (cannot confirm or deny via public IG fetch)

## Verdict

**🚨 ACTION_NEEDED**

The calendar has no `2026-07-19-schedule` entry with `status=posted`. The Mac mini cron (`scripts/run-daily-schedule.mjs`) either did not fire or failed silently. IG could not be verified due to login wall.

### To fire manually from your Mac

```bash
cd "/Users/noahajeo/Projects/schedule-render-postschedule"
node scripts/run-daily-schedule.mjs
```

Or from the repo root if the script lives there:

```bash
cd "/Users/joestevens/Projects/Different Breed"
node scripts/run-daily-schedule.mjs
```
