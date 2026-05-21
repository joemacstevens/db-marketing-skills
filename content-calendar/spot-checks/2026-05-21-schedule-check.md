# Schedule Story Spot-Check — 2026-05-21

## Run Info
- **UTC:** 2026-05-21T12:10:54Z
- **ET:** 2026-05-21 08:10 AM ET

## Calendar Entry Status
- `content-calendar/calendar.json` — **FILE NOT FOUND**
- Entry `2026-05-21-schedule` with `content_type == "schedule"` — **MISSING** (no calendar file exists)

## IG Verification
- Fetch of `https://www.instagram.com/dbelitefitness/` returned **HTTP 403 Forbidden** (login wall)
- Unable to verify live story status from public profile
- Result: **INCONCLUSIVE**

## Verdict
**ACTION_NEEDED**

`calendar.json` does not exist and there is no way to verify the story was posted via IG. The cron script at `/Users/noahajeo/.../scripts/run-daily-schedule.mjs` has likely failed silently again.

---

**Joey — fire manually from your Mac:**
```
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
