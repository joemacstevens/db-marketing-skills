# Schedule Story Spot-Check — 2026-09-25

**Run timestamp:** 2026-09-25T12:14:44Z (8:14 AM ET)

---

## Calendar Entry Status

- **Looking for:** `id == "2026-09-25-schedule"` with `content_type == "schedule"`
- **Result:** NOT FOUND
- **Last schedule entry in calendar.json:** `2026-04-28-schedule` (status: `posted`)
- **Calendar last updated:** 2026-08-03T16:14:46.008Z

The Mac mini cron has not written any schedule entries to `calendar.json` since April 28, 2026 — approximately 5 months of missed updates. This confirms the cron has been silently failing.

---

## IG Verification

- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** BLOCKED — network egress proxy denied access to instagram.com in this cloud env
- **Status:** Inconclusive — could not verify whether a story was posted via direct IG check

---

## Verdict

**`ACTION_NEEDED`**

No `2026-09-25-schedule` entry exists in `calendar.json`. The cron appears to have stopped updating the calendar around late April 2026. IG could not be verified independently due to proxy restrictions.

**Joey must fire manually:**
```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

Also worth investigating why the Mac mini cron stopped logging to `calendar.json` — check `cron/heartbeat.json` and the cron logs on the Mac mini.
