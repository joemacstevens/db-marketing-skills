# Schedule Story Spot-Check — 2026-05-09

**Run timestamp:** 2026-05-09T12:08:36Z / 2026-05-09 08:08:36 EDT

---

## Calendar Entry

- **Expected ID:** `2026-05-09-schedule`
- **Status:** `content-calendar/calendar.json` does not exist in the repo — entry cannot be found.
- **Verdict:** MISSING

## IG Verification

- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 Forbidden (login wall / blocked in cloud env)
- **Conclusion:** Unable to verify via public IG fetch — inconclusive.

## Verdict

**ACTION_NEEDED**

`calendar.json` is absent and the IG profile is behind a login wall, so no evidence the story was posted. Treat as missing until confirmed otherwise.

## Recommended Action

Fire the script manually from your Mac:

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

Also consider creating `content-calendar/calendar.json` so future checks have a status source.
