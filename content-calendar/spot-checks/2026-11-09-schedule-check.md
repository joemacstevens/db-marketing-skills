# Schedule Story Spot-Check — 2026-11-09

**Run timestamp:** 2026-11-09 12:05:59 UTC / 07:05:59 EST

---

## Calendar Entry Status

- **Entry searched:** `id == "2026-11-09-schedule"` with `content_type == "schedule"`
- **Result:** **MISSING** — no matching entry found in `content-calendar/calendar.json`

## IG Verification

- **URL checked:** `https://www.instagram.com/dbelitefitness/`
- **Result:** **INCONCLUSIVE** — Instagram is outside the allowed network domains for this cloud environment (DNS resolution failed). Cannot verify live from here.

## Verdict

> **ACTION_NEEDED**

The `2026-11-09-schedule` entry is absent from `calendar.json`, meaning the Mac mini cron either did not fire or did not write back a posted status. IG could not be independently verified from this environment.

---

## Action

Joey must fire the schedule story manually from the Mac mini:

```bash
cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
```

After it posts, the script should update `calendar.json` with `status: "posted"` for today's entry. If it doesn't, update manually or investigate the write-back step in `scripts/run-daily-schedule.mjs`.
