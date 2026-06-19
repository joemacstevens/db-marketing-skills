# Schedule Story Spot-Check — 2026-05-22

**Run timestamp:** 2026-05-22 12:11 UTC / 08:11 EDT

---

## Calendar Entry Status

`content-calendar/calendar.json` **does not exist** — the file is absent from the repo entirely. No entry with `id == "2026-05-22-schedule"` can be found.

Result: **MISSING**

---

## IG Verification

- URL checked: `https://www.instagram.com/dbelitefitness/`
- Result: **HTTP 403 Forbidden** (login wall / blocked public access)
- Unable to confirm or deny a live story from this environment.

Result: **INCONCLUSIVE**

---

## Verdict: `ACTION_NEEDED`

`calendar.json` does not exist and the cron has been failing silently. Today's schedule story has not been recorded as posted. IG cannot be independently verified from this cloud environment.

**Joey — fire manually from your Mac:**

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```
