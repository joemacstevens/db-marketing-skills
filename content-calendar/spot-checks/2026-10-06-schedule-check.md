# Schedule Story Spot-Check — 2026-10-06

**Run time:** 2026-10-06 12:15 UTC / 08:15 EDT

---

## Calendar Entry

- **Looking for:** `id = "2026-10-06-schedule"`, `content_type = "schedule"`
- **Result:** MISSING — no matching entry found in `content-calendar/calendar.json`

## IG Verification

- **URL:** https://www.instagram.com/dbelitefitness/
- **Result:** BLOCKED — outbound access to instagram.com denied by network egress proxy in this cloud env. Unable to verify live.

## Verdict: ACTION_NEEDED

The daily schedule story for **2026-10-06** has no calendar entry and no confirmation of posting. The Mac mini cron (12:01 AM ET) either did not fire or failed silently.

**Joey — fire manually from your Mac:**
```bash
cd "/Users/joestevens/Projects/Different Breed"
node scripts/run-daily-schedule.mjs
```
