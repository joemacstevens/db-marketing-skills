# Schedule Story Spot-Check — 2026-09-18

**Run timestamp:** 2026-09-18T12:11:38 UTC / 08:11:38 ET

---

## Calendar Entry Status

- **Checked ID:** `2026-09-18-schedule`
- **Result:** MISSING — no entry found in `content-calendar/calendar.json`

The most recent schedule entry in the calendar is `2026-04-28-schedule` (status: `posted`). No schedule story has been logged since late April 2026 — approximately **143 days** of entries are absent. This confirms the Mac mini cron has been silently failing for months, not just a day.

## IG Verification

- **URL checked:** `https://www.instagram.com/dbelitefitness/`
- **Result:** BLOCKED — outbound access to instagram.com is blocked by the cloud environment's egress proxy. Unable to verify live story presence.

## Verdict

**🚨 ACTION_NEEDED**

The schedule story for 2026-09-18 is missing from the calendar and cannot be verified on IG. The cron has not logged a schedule post since 2026-04-28. Manual intervention required.

---

## Recommended Action

Fire the script manually from the Mac:

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

Then investigate why the cron stopped logging entries after 2026-04-28 (check `cron/heartbeat.json` and the Mac mini launchd/cron config).
