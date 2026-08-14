# Schedule Story Spot-Check — 2026-08-14

**Run timestamp:** 2026-08-14T13:05:44Z (09:05 EDT)
**Checked by:** Automated daily sanity check (8 AM ET cron)

---

## Calendar Entry

- **Expected ID:** `2026-08-14-schedule`
- **Status:** ❌ MISSING — no entry found in `content-calendar/calendar.json`
- **Last schedule entry on record:** `2026-04-28-schedule` (status: posted)
- **Gap:** 108 days of missing schedule posts (2026-04-29 through today)

## IG Verification

- **URL checked:** `https://www.instagram.com/dbelitefitness/`
- **Result:** BLOCKED — egress proxy denied access to instagram.com in this cloud environment
- **Conclusion:** Unable to verify via live IG fetch; calendar.json is the authoritative signal

## Verdict

### 🚨 ACTION_NEEDED

The Mac mini cron (`scripts/run-daily-schedule.mjs`) has not posted a schedule story since **2026-04-28**. Today's story for 2026-08-14 is missing from the calendar and was not posted automatically.

Joey must fire it manually from his Mac:

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

Additionally, the cron itself should be investigated — it appears to have been silently failing for over 3 months.
