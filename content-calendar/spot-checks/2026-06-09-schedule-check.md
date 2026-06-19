# Schedule Story Spot-Check — 2026-06-09

**Run timestamp:** 2026-06-09 12:11 UTC / 08:11 EDT

---

## Calendar Entry Status

**MISSING** — `content-calendar/calendar.json` does not exist in the repo.  
Cannot locate entry `2026-06-09-schedule` with `content_type == "schedule"`.

## IG Verification

- URL checked: `https://www.instagram.com/dbelitefitness/`
- Result: **HTTP 403 Forbidden** (login wall — public fetch blocked)
- Verdict: **Inconclusive** (IG cannot be verified from this environment)

## Verdict

### 🚨 ACTION_NEEDED

`calendar.json` is absent — the cron script likely has not run or has not been writing its status back to the repo. Today's schedule story has no confirmed posted status. Joey must fire it manually.

---

**Manual fire command:**
```
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

**Also worth investigating:**
- Why `content-calendar/calendar.json` is missing (cron may have been failing for multiple days)
- Check cron logs on the Mac mini: `crontab -l` and `/var/log/system.log` or `grep CRON /var/log/syslog`
