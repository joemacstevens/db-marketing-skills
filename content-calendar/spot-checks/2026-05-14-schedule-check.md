# Schedule Story Spot-Check — 2026-05-14

**Run timestamp:** 2026-05-14T12:10:29Z / 2026-05-14 08:10 AM EDT

## Calendar Entry Status

`content-calendar/calendar.json` **does not exist** — no entry for `2026-05-14-schedule` found.

Status: **MISSING**

## IG Verification

Fetch of `https://www.instagram.com/dbelitefitness/` returned **HTTP 403 Forbidden** (login wall). Unable to confirm or deny a story on the live profile.

Status: **INCONCLUSIVE**

## Verdict

**ACTION_NEEDED**

`calendar.json` is absent (primary signal). IG fetch hit a login wall and cannot confirm posting. The cron job at `/Users/noahajeo/...` has been failing silently; this is at least the 16th consecutive miss (logs show gaps from 2026-04-29 onward, and 2026-05-11 is also unaccounted for).

**Joey — fire manually from your Mac:**
```
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
