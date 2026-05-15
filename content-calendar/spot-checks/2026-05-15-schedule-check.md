# Schedule Story Spot-Check — 2026-05-15

| Field | Value |
|---|---|
| Run timestamp (UTC) | 2026-05-15T12:08:07Z |
| Run timestamp (ET) | 2026-05-15 08:08:07 EDT |
| Target entry ID | `2026-05-15-schedule` |

## Calendar Entry Status

**MISSING** — `content-calendar/calendar.json` does not exist in the repo. No entry for `2026-05-15-schedule` can be found.

## Instagram Verification

URL checked: `https://www.instagram.com/dbelitefitness/`
Result: **HTTP 403 Forbidden** (login wall — public fetch blocked by Instagram)
Conclusion: **Inconclusive** — cannot confirm or deny a story from the public profile.

## Verdict

### 🚨 ACTION_NEEDED

The calendar file is absent and IG is unverifiable. The cron at `/Users/noahajeo/.../scripts/run-daily-schedule.mjs` has likely been failing silently. Joey must fire the schedule story manually from his local Mac.

**Command to run:**
```
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
