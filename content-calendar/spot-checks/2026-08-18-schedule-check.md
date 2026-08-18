# Schedule Story Spot-Check — 2026-08-18

| Field | Value |
|---|---|
| Run timestamp (UTC) | 2026-08-18T12:16:13Z |
| Run timestamp (ET) | 2026-08-18 08:16:13 EDT |
| Date checked | 2026-08-18 |
| Target entry ID | `2026-08-18-schedule` |

## Calendar Status

**MISSING** — No entry with `id == "2026-08-18-schedule"` found in `content-calendar/calendar.json`.

Last schedule entry found: `2026-04-28-schedule` (status: `posted`). There is a ~112-day gap between the last posted schedule and today, indicating the Mac mini cron has been silently failing since late April 2026.

## Instagram Verification

**BLOCKED** — Outbound access to `www.instagram.com` is blocked by the cloud environment's network egress proxy. Unable to verify directly from IG whether a story was manually posted but not reflected in the calendar.

## Verdict

**ACTION_NEEDED**

The calendar entry is missing. The cron at `/Users/noahajeo/...` has not posted a schedule story today (or for the past ~112 days). Joey must fire the script manually from the Mac mini.

**Manual fire command:**
```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

After firing, the script should update `content-calendar/calendar.json` with a new `2026-08-18-schedule` entry at status `posted`.
