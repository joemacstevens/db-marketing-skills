# Schedule Story Spot-Check — 2026-11-14

## Run Info
- **UTC:** 2026-11-14T12:04:18Z
- **ET:**  2026-11-14 07:04:18 EST
- **Triggered by:** Automated daily sanity-check cron (8 AM ET)

## Calendar Check
- **Target entry:** `id = "2026-11-14-schedule"`, `content_type = "schedule"`
- **Result:** **MISSING** — no entry for today in `content-calendar/calendar.json`
- **Most recent schedule entry found:** `2026-04-28-schedule` (status: posted)
- **Calendar last_updated:** `2026-09-29T01:10:04.777Z`

The Mac mini cron (`scripts/run-daily-schedule.mjs`) has not written a schedule entry since **April 28, 2026** — approximately **200 days ago**. The calendar.json `last_updated` timestamp shows September 29, suggesting other calendar writes have happened but the schedule job has not been contributing.

## IG Verification
- **URL attempted:** `https://www.instagram.com/dbelitefitness/`
- **Result:** `ENOTFOUND` — Instagram is outside this cloud session's allowed network domains. Cannot verify via live fetch.
- **Conclusion:** Inconclusive (treat as unable to verify)

## Verdict

**ACTION_NEEDED**

The calendar has no record of today's schedule story and the last automated schedule post was over 6 months ago. The Mac mini cron job appears to have been failing silently since late April 2026.

## Action Required
Fire manually from your Mac:

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

Also worth investigating why the cron has been silent — check:
- `cron/heartbeat.json` on the Mac mini (file not present in repo)
- Mac mini cron logs: `crontab -l` and `~/Library/Logs/` or system logs
- Whether `run-daily-schedule.mjs` exits cleanly or throws an uncaught error
