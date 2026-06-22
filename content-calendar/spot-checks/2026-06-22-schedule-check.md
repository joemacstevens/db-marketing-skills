# Schedule Story Spot-Check — 2026-06-22

**Run timestamp:** 2026-06-22T12:03:11Z / 2026-06-22 08:03 EDT

---

## Calendar Entry

**Status: MISSING**

Searched `content-calendar/calendar.json` for `id == "2026-06-22-schedule"` and `content_type == "schedule"`. No match found. The Mac mini cron (`scripts/run-daily-schedule.mjs`) did not create or post today's schedule story.

Last successful schedule entries visible in calendar end at `2026-04-21-schedule` (posted). The calendar `last_updated` is `2026-04-25T04:05:07.525Z` — no automated schedule posts have been recorded since late April.

---

## IG Verification

**Status: INCONCLUSIVE** — `https://www.instagram.com/dbelitefitness/` returned HTTP 403 (login wall). Unable to verify whether a story was posted outside the calendar pipeline.

---

## Verdict

**ACTION_NEEDED**

The schedule story for Monday 2026-06-22 has not been posted (no calendar entry, IG unverifiable). This is consistent with the multi-day silent failure pattern described in the task brief.

### Manual fix

```bash
cd "/Users/joestevens/Projects/Different Breed"
node scripts/run-daily-schedule.mjs
```

Run from your Mac to post today's story manually.
