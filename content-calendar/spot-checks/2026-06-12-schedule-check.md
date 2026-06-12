# Schedule Story Spot-Check — 2026-06-12

| Field | Value |
|---|---|
| Run timestamp (UTC) | 2026-06-12 12:03 UTC |
| Run timestamp (ET) | 2026-06-12 08:03 EDT |
| Date checked | 2026-06-12 |

## Calendar Entry Status

**MISSING** — `content-calendar/calendar.json` does not exist in the repo. No entry for `2026-06-12-schedule` could be found.

## IG Verification

**Blocked (403 Forbidden)** — `https://www.instagram.com/dbelitefitness/` returned HTTP 403. Login wall prevents public profile inspection. Unable to verify whether a story was posted.

## Verdict

**ACTION_NEEDED**

- `calendar.json` is absent, meaning the cron-posted story was never logged as `posted`.
- IG verification inconclusive (login wall).
- Primary signal (calendar entry) confirms the story has not been recorded as shipped.

Joey must fire the schedule post manually from the Mac mini.

```
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
