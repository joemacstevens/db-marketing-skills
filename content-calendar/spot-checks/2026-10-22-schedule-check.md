# Schedule Story Spot-Check — 2026-10-22

**Run timestamp:** 2026-10-22 12:12 UTC / 08:12 ET

---

## Calendar Entry Status

**MISSING** — No entry with `id == "2026-10-22-schedule"` found in `content-calendar/calendar.json`.

Last schedule entry in calendar: `2026-04-28-schedule` (status: `posted`) — approximately 6 months ago with no schedule posts recorded since.

---

## Instagram Verification

**Unable to verify** — `www.instagram.com` is not reachable from this cloud environment (DNS resolution failed). The calendar.json check is the primary signal.

---

## Verdict

**ACTION_NEEDED**

The Mac mini cron (`scripts/run-daily-schedule.mjs`, scheduled 12:01 AM ET) has not posted the schedule story for today and calendar.json contains no entry for this date. The automated pipeline appears to have been silently failing for approximately 6 months (last recorded post: 2026-04-28).

**Joey must fire this manually from the Mac:**

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

Recommend also checking the Mac mini cron configuration to restore automation.
