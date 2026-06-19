# Handoff: Deploy the redesigned daily schedule story to the mini cron

**For:** the Claude Code agent on the Mac mini (`noahajeo`).
**Goal:** make the 12:01 AM nightly schedule-story cron render the **redesigned**
`ScheduleReel` (Stamp/Poster look) instead of the old Oswald/red one. No change to
the MindBody fetch, props, or publish steps — only the Remotion composition changed.

---

## What changed (already committed to `db-marketing-skills`, branch `main`)

- `reels/src/ScheduleReel.tsx` — rebuilt on the **Stamp/Poster design system**
  (black/red/bone, NORD Black Italic, hard 4px offset shadow, red skew-highlight,
  knockout seal). It's a **10s / 300-frame** Story now (was 15s): 0–6s is the
  bone schedule card mirroring the site's `ScheduleStrip` ("Today's **Rounds**",
  red NORD-italic times, ink class names) over real action b-roll; 6–10s is an
  animated end tag that mirrors the site's `HeroHeadline` — "Evolve Into Greatness"
  mask-wipes to "Become A Different Breed".
- **NEW** `reels/src/design-system/` (tokens, components, font loader) — these were
  previously untracked; now committed. Jab101 and the rest of the 2026 reel slate
  also depend on this dir.
- **NEW** assets committed (all small, git-friendly): `reels/public/fonts/NORD-*.otf`
  (5 cuts), `reels/public/design-system/seal-black.png` + `seal-white.png`, and the
  two background clips `reels/public/youth-invest/yi-open.mp4` +
  `yi-confidence.mp4` (~8 MB total — from the YouthInvest reel).

**Same as before — do NOT re-transfer:** the `ScheduleReel` props contract
(`{schedule, timezone, maxItems}`) and the music pool (`reels/public/tracks/`,
already tracked). Because the new background clips are committed, a `git pull`
brings **everything** the render needs — no manual clip copy required anymore.
(The old `sched-bg-*.mp4` clips are no longer used and were never in git.)

Preview the look first: render output + beat stills are in
`reels/out/preview/` on Joey's MacBook (not committed). If you want your own,
render it (step 4 below) and eyeball it before flipping the cron.

---

## Deploy — pick the path that matches the mini's actual layout

First, see how the cron renders today:
```bash
cat /Users/noahajeo/Projects/schedule-render-postschedule/scripts/nightly-render.sh
```
Look at which Remotion project the `npx remotion render ... ScheduleReel` line uses.

### Path A — point the cron at this repo's `reels/` (recommended, single source)
Per `CLAUDE.md`, `reels/` is meant to be the one shared Remotion project. Cleanest
long-term: render from a checkout of `db-marketing-skills` and retire the separate
`Schedule Automation/remotion/` copy.

```bash
# 1. Get the repo on the mini (clone if absent, else pull latest main)
git -C /Users/noahajeo/Projects/db-marketing-skills pull --ff-only \
  || git clone https://github.com/joemacstevens/db-marketing-skills.git \
       /Users/noahajeo/Projects/db-marketing-skills

# 2. Install deps (gets @remotion/google-fonts for Barlow, etc.)
cd /Users/noahajeo/Projects/db-marketing-skills/reels && npm install

# 3. Copy the b-roll clips the mini already has into this checkout's public/
#    (they're gitignored-by-omission; reuse, don't re-download)
cp /Users/noahajeo/Projects/schedule-render-postschedule/Schedule\ Automation/remotion/public/sched-bg-*.mp4 \
   /Users/noahajeo/Projects/db-marketing-skills/reels/public/   # adjust source path to wherever the mini keeps them

# 4. Smoke-test
npx remotion render src/index.ts ScheduleReel out/smoke.mp4
open out/smoke.mp4

# 5. Update nightly-render.sh: SCHEDULE_ROOT / the render `cd` target → this reels/ dir
```

### Path B — keep the separate project, copy the new files in
If the cron's Remotion project must stay where it is, copy these from the repo into
that project (same relative paths), then `npm install` + smoke-test:

| From `db-marketing-skills/reels/` | Notes |
|---|---|
| `src/ScheduleReel.tsx` | the redesign |
| `src/design-system/` (whole dir) | tokens, components, loadFonts — **new** |
| `src/components/BrandStyles.ts` | design-system re-exports reel dims from it (probably already present) |
| `public/fonts/NORD-*.otf` | **new** — NORD display family |
| `public/design-system/seal-black.png`, `seal-white.png` | **new** — knockout seal |
| `public/youth-invest/yi-open.mp4`, `yi-confidence.mp4` | **new** — action backgrounds (~8 MB) |

`src/schedule/` (props, dates, tracks) and `public/tracks/` should already be in
that project from the current cron — leave them. The old `public/sched-bg-*.mp4`
are no longer referenced.

```bash
cd <that-remotion-project> && npm install
npx remotion render src/index.ts ScheduleReel out/smoke.mp4 && open out/smoke.mp4
```

---

## Verify before relying on the cron
- Smoke render plays: bone schedule card over darkened b-roll, NORD italic, red
  "Rounds" highlight, seal end card. No missing-font fallback (if type looks like
  plain Arial, NORD didn't load — check `public/fonts/`).
- Then either wait for the 12:01 AM run or trigger `nightly-render.sh` manually with
  `UPLOAD_POST_ENABLED=0` to render-only without posting.

## Rollback
The old composition is one commit back. `git revert` the redesign commit (Path A) or
restore the previous `ScheduleReel.tsx` from git history (Path B).

## Reference
Full pipeline runbook: `skills/schedule-pipeline.md` (updated — see the
"Deploying a render-code change to the mini" section).
