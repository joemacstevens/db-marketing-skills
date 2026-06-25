# Schedule Story Spot-Check — 2026-06-25

| Field | Value |
|---|---|
| Run timestamp (UTC) | 2026-06-25T12:03:01Z |
| Run timestamp (ET) | 2026-06-25 08:03 AM ET |

## Calendar Entry

- **Expected ID:** `2026-06-25-schedule`
- **Status:** MISSING — no entry found in `content-calendar/calendar.json`
- **Last schedule entry in calendar:** `2026-04-25-schedule` (status: `posted`)
- **Gap:** Calendar has not been updated since 2026-04-25 (~61 days ago)

## Instagram Verification

- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — login wall, content not accessible
- **Conclusion:** Inconclusive (login wall expected on public fetch)

## Verdict

**`ACTION_NEEDED`**

The Mac mini cron has not logged a schedule story to `calendar.json` since 2026-04-25. Today's entry (`2026-06-25-schedule`) is absent. The story must be fired manually.

```
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
