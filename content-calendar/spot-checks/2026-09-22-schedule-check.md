# Schedule Story Spot-Check — 2026-09-22

**Run timestamp:** 2026-09-22 12:11 UTC / 08:11 EDT

---

## Calendar Entry Status

**Result: MISSING**

Queried `content-calendar/calendar.json` for `id == "2026-09-22-schedule"` with `content_type == "schedule"`.

- Entry not found.
- Also checked for any `content_type == "schedule"` post dated `2026-09-22` — none found.
- **Last successful schedule post:** `2026-04-28` (posted to IG + FB, both `completed`). That is **147 days ago**.

The cron job (`scripts/run-daily-schedule.mjs` on the Mac mini) has been silently failing since at least April 28.

---

## IG Verification

- URL: `https://www.instagram.com/dbelitefitness/`
- **Result: INCONCLUSIVE** — outbound access to instagram.com is blocked by the cloud environment's egress proxy. Cannot verify live story presence.
- Calendar check is the primary signal; IG result treated as unable to verify.

---

## Verdict: `ACTION_NEEDED`

The schedule story for **2026-09-22** is missing from the calendar. The Mac mini cron has not posted a schedule story in 147 days. Manual intervention required.

### Recommended action

1. Fire today's story manually from your Mac:
   ```bash
   cd "/Users/joestevens/Projects/Different Breed" && node scripts/run-daily-schedule.mjs
   ```
2. Check the Mac mini cron logs to diagnose why it stopped firing after 2026-04-28 (process crash, credential expiry, schedule misconfiguration, etc.).
3. Check `cron/heartbeat.json` for cron health signals.
