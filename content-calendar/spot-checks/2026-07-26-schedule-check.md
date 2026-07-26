# Schedule Story Spot-Check — 2026-07-26

**Run timestamp:** 2026-07-26T12:11:32Z / 2026-07-26 08:11 ET

---

## Calendar Entry

- **Looking for:** `id = "2026-07-26-schedule"`, `content_type = "schedule"`
- **Result:** MISSING — no entry found for today in `content-calendar/calendar.json`
- **Last schedule entry in calendar:** `2026-04-25-schedule` (status: `posted`) — **~3 months ago**

## IG Verification

- **URL checked:** https://www.instagram.com/dbelitefitness/
- **Result:** HTTP 403 — login wall, content not accessible without authentication
- **Conclusion:** Unable to verify via public profile fetch; treating calendar.json as primary signal

## Verdict

> **ACTION_NEEDED**

The `2026-07-26-schedule` entry is absent from `calendar.json`, and the cron has not produced a schedule post since `2026-04-25` (last posted entry). The Mac mini cron appears to have been silently failing for approximately 3 months.

**Joey must fire manually from the Mac:**

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

After the story posts, update `calendar.json` with a `2026-07-26-schedule` entry at `status: posted` to clear future alarms.
