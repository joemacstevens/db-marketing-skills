# Schedule Story Spot-Check — 2026-11-13

**Run timestamp:** 2026-11-13 12:05 UTC / 07:05 ET

---

## Calendar Entry Status

**MISSING** — No entry with `id == "2026-11-13-schedule"` and `content_type == "schedule"` exists in `content-calendar/calendar.json`.

---

## Instagram Verification

**INCONCLUSIVE** — `www.instagram.com` is not reachable from this cloud environment (outside allowed network domains). Cannot verify whether a story was posted independently of the calendar.

---

## Verdict: `ACTION_NEEDED`

The Mac mini cron was supposed to fire `scripts/run-daily-schedule.mjs` at 12:01 AM ET and write a `posted` entry to `calendar.json`. Neither has happened as of 07:05 ET. Instagram cannot be verified from this environment, but the missing calendar entry is the primary signal of a miss.

**Joey must fire manually from the Mac:**
```
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
