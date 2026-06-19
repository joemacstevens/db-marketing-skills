# Skill: Schedule Pipeline (Technical Runbook)

## Purpose
Complete technical reference for generating and publishing the daily "Today's Card" schedule story for Different Breed Elite Fitness. This covers the end-to-end pipeline: fetching live class data → rendering animated video → publishing to IG + FB as Stories.

## Architecture Overview

```
MindBody API (live schedule)
    ↓
fetch-mindbody-official.mjs → schedule.json
    ↓
Remotion ScheduleReel composition → MP4 (1080×1920, 12s, 30fps)
    ↓
Upload-Post SDK → IG Story + FB Story (account: dbelitefitness)
```

**All pipeline scripts live on the Mac mini at:**
`/Users/noahajeo/Projects/schedule-render-postschedule/scripts/`

**Remotion project lives at:**
`/Users/noahajeo/Projects/schedule-render-postschedule/Schedule Automation/remotion/`

---

## Step 1: Fetch Schedule from MindBody

**Script:** `scripts/fetch-mindbody-official.mjs`

```bash
node scripts/fetch-mindbody-official.mjs [YYYY-MM-DD] [output-path]
```

- **API:** MindBody Official v6 — `https://api.mindbodyonline.com/public/v6/class/classes`
- **Site ID:** `706438`
- **API Key:** `5f2a6fa56beb4023887d74a2e242d3e0` (hardcoded in script — public API key)
- **Headers required:** `Api-Key`, `SiteId`, `Content-Type: application/json`
- **Query params:** `StartDateTime=YYYY-MM-DDT00:00:00`, `EndDateTime=YYYY-MM-DDT23:59:59`
- **Timezone:** `America/New_York`

**Output format** (written to `schedule.json`):
```json
[{
  "schedule": [
    {
      "id": "2026-04-21-6:00 AM-Boxing Basics",
      "time": "6:00 AM",
      "iso": "2026-04-21T06:00:00",
      "class": "Boxing Basics",
      "coach": "Coach Joe",
      "status": "active"
    }
  ],
  "scheduleDate": "2026-04-21T04:01:00.000Z"
}]
```

**Filtering logic:**
- Excludes cancelled classes (`IsCanceled: true`)
- Excludes "Special event" program type
- Excludes midnight entries (`T00:00`) — these are packages, not real classes
- Sorted by start time

**If 0 classes found**, the pipeline exits cleanly (no render, no post). This is normal for gym-closed days.

---

## Step 2: Render the Animated Schedule Video

**Remotion project:** `Schedule Automation/remotion/`
**Composition:** `ScheduleReel` (defined in `src/Root.tsx`)
**Entry point:** `src/index.ts`

```bash
cd "/Users/noahajeo/Projects/schedule-render-postschedule/Schedule Automation/remotion"

# Build props JSON from schedule.json
node -e "
const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('../schedule.json', 'utf8'));
const first = Array.isArray(raw) ? raw[0] : raw;
const props = {
  schedule: (first.schedule || []).map(s => ({
    id: s.id, iso: s.iso, class: s.class, coach: s.coach, status: s.status
  })),
  timezone: 'America/New_York',
  maxItems: 12
};
fs.writeFileSync('/tmp/schedule-props.json', JSON.stringify(props));
"

# Render
npx remotion render src/index.ts ScheduleReel "out/next-24-hours-$(date +%F).mp4" \
  --props=/tmp/schedule-props.json --log=info
```

**Video specs:**
- Resolution: 1080 × 1920 (9:16 vertical Story format)
- Duration: 300 frames / 10 seconds @ 30fps (fits one IG/FB Story segment)
- Codec: H.264 (default)
- **Design: Stamp/Poster system** (redesigned 2026-06-18). Black/red/bone, NORD
  Black Italic display, Barlow body, hard 4px offset shadow, red skew-mark,
  knockout seal — matches the main gym site (`main-site/`) and the 2026 reel
  slate. Replaces the legacy Oswald/`#C4161C` look.
- Beats (built for Stories — lead with the value, close on the brand):
  - **0–6s** pinned **bone schedule card** over real action b-roll (kids sparring
    + combos from the YouthInvest reel). Echoes the site's ScheduleStrip: "Today's
    **Rounds**", red NORD-italic times, ink class names, uppercase coach tags.
  - **6–10s** animated end tag that mirrors the site's `HeroHeadline`: "Evolve
    Into Greatness" mask-wipes up, then swaps to "Become A Different Breed"
    (red skew-mark on line 2), knockout seal + @dbelitefitness.
- Layout auto-adjusts for 4 vs 6+ classes (small mode at ≥5 rows). Caps at 6
  visible rows; extras roll up into a "+N More" stamp.
- Background b-roll: `reels/public/youth-invest/yi-open.mp4` (ring sparring) +
  `yi-confidence.mp4` (combos), alternating with a cross-dissolve. Daily music
  still rotates deterministically by date hash. (The "Today's Word" quote beat
  was removed when the cut went to 10s.)

**Props schema:**
```typescript
interface ScheduleReelProps {
  schedule: Array<{
    id: string;
    iso: string;
    class: string;
    coach: string;
    status: string;
  }>;
  timezone: string;  // 'America/New_York'
  maxItems: number;  // 12
}
```

---

## Step 3: Publish via Upload-Post

**Script:** `scripts/post-via-uploadpost.mjs`

```bash
# Requires secrets.env to be loadable
node scripts/post-via-uploadpost.mjs "/path/to/rendered-video.mp4" "Today's Card — Monday"
```

**What it does:**
1. Loads API key from `/Users/noahajeo/.openclaw/secrets.env` (`UPLOAD_POST_API_KEY`)
2. Calls `client.upload(videoPath, { ... })` with:
   - `user: 'dbelitefitness'` (CASE-SENSITIVE)
   - `platforms: ['instagram', 'facebook']`
   - `instagramMediaType: 'STORIES'`
   - `facebookMediaType: 'STORIES'`
   - `title`: the caption string (e.g. "Today's Card — Monday")
3. If upload goes async (large file), polls `api.upload-post.com/api/uploadposts/status` every 15s for up to 20 attempts (~5 min)
4. Logs to `/Users/noahajeo/Library/Logs/uploadpost-publish.jsonl`

**Exit codes:**
- `0` = success, all platforms delivered
- `2` = delivery completed but some platforms failed
- `3` = timeout waiting for delivery confirmation (may still succeed)
- `1` = hard failure

**Upload-Post SDK usage:**
```javascript
import { UploadPost } from 'upload-post/index.js';
const client = new UploadPost(apiKey);

const res = await client.upload(videoPath, {
  title: "Today's Card — Monday",
  user: 'dbelitefitness',
  platforms: ['instagram', 'facebook'],
  instagramMediaType: 'STORIES',
  facebookMediaType: 'STORIES'
});
```

---

## Step 4: The All-In-One Orchestrator

**Script:** `scripts/nightly-render.sh`

```bash
bash /Users/noahajeo/Projects/schedule-render-postschedule/scripts/nightly-render.sh
```

This single script runs the full pipeline:
1. Fetches schedule from MindBody for today's date
2. Checks class count — exits if 0
3. Builds props JSON from schedule.json
4. Renders the Remotion `ScheduleReel` composition
5. Copies rendered MP4 to Google Drive outbox (`PostSchedule/`)
6. Publishes via Upload-Post (IG + FB Stories)

**Environment variables (optional overrides):**
- `SCHEDULE_ROOT` — defaults to `/Users/noahajeo/Projects/schedule-render-postschedule/Schedule Automation`
- `POSTSCHEDULE_OUTBOX` — defaults to Google Drive `PostSchedule/`
- `UPLOAD_POST_ENABLED` — set `0` to skip publishing (render only)

**Output file:** `next-24-hours-YYYY-MM-DD.mp4` in `remotion/out/`

---

## Deploying a render-code change to the mini

**Source of truth for the composition is this repo: `reels/src/ScheduleReel.tsx`.**
That's where the design work + previews happen (`reels/out/preview/`). The nightly
cron renders from the mini's own copy of the Remotion project, so a code change here
does **not** reach the cron until the mini's project is updated.

The redesigned `ScheduleReel.tsx` depends on the new design system + its assets. If
the mini's Remotion project is a separate checkout (per the paths above), these all
need to land there together:

| What | Path in `reels/` |
|------|------------------|
| Composition | `src/ScheduleReel.tsx` |
| Design system (tokens, components, font loader) | `src/design-system/` (whole dir) |
| Legacy tokens it re-exports dimensions from | `src/components/BrandStyles.ts` |
| Schedule support (props, dates, quotes, tracks) | `src/schedule/` |
| NORD display font (5 cuts) | `public/fonts/NORD-*.otf` |
| Knockout seal | `public/design-system/seal-black.png`, `seal-white.png` |
| Background b-roll | `public/sched-bg-1..4.mp4` |
| Music pool | `public/tracks/` |

Dependency: `@remotion/google-fonts` must be installed on the mini (Barlow).

**Recommended:** point the mini's cron at this repo's `reels/` directly (single
Remotion project, per `CLAUDE.md`) and `git pull` to deploy. Either way, after
syncing, smoke-test on the mini with:
`cd reels && npx remotion render src/index.ts ScheduleReel out/smoke.mp4`

## Current Cron Schedule (OpenClaw)

The daily schedule story currently runs via an OpenClaw cron job:
- **Name:** `DBE daily schedule fetch + render`
- **Schedule:** `1 0 * * *` (12:01 AM ET daily)
- **Timeout:** 420 seconds (7 min)
- **Delivers to:** Discord channel for visibility

### Other Related Crons

- **Monday Google Review Story** — `0 19 * * 1` (7 PM ET Mondays)
  - Pulls a random 5-star Google review → renders ReviewSpotlight Remotion composition → publishes as Story
  - Uses `goplaces` for review data, same Upload-Post publish path

- **Tuesday Myth vs Fact Reel** — `30 10 * * 2` (10:30 AM ET Tuesdays)
  - Renders 8s MythFactShort template → publishes as Reel (not Story)
  - IG + FB Reels via Upload-Post

---

## Key File Locations

| What | Path |
|------|------|
| Pipeline scripts | `/Users/noahajeo/Projects/schedule-render-postschedule/scripts/` |
| Remotion project | `/Users/noahajeo/Projects/schedule-render-postschedule/Schedule Automation/remotion/` |
| schedule.json (live data) | `/Users/noahajeo/Projects/schedule-render-postschedule/Schedule Automation/schedule.json` |
| Rendered output | `Schedule Automation/remotion/out/next-24-hours-YYYY-MM-DD.mp4` |
| Google Drive outbox | `~/Library/CloudStorage/GoogleDrive-joemac@ajeo.design/My Drive/PostSchedule/` |
| Upload-Post logs | `/Users/noahajeo/Library/Logs/uploadpost-publish.jsonl` |
| Secrets (API keys) | `/Users/noahajeo/.openclaw/secrets.env` |
| Remotion components | `remotion/src/ScheduleReel.tsx`, `Root.tsx`, `brand.ts` |

## Troubleshooting

- **0 classes returned:** Check if the gym is actually open today. MindBody may be down — retry after 5 min.
- **Render fails:** Check `npx remotion render` output. Common: missing npm packages (run `npm install` in remotion dir).
- **Upload-Post timeout (exit 3):** Story may still process. Check IG/FB manually before re-posting.
- **Wrong schedule date:** The pipeline uses `TZ=America/New_York date +%F`. If running after midnight UTC but before midnight ET, this is correct.

## Fallback: Manual Schedule Data

If MindBody API is down, you can manually write `schedule.json` using the known schedule from `brand-context/schedule.md`:

```json
[{
  "schedule": [
    {"id": "manual-1", "time": "4:00 PM", "iso": "2026-04-21T16:00:00", "class": "Kids Boxing", "coach": "Glenda, Joe, Ali", "status": "active"}
  ],
  "scheduleDate": "2026-04-21T00:00:00.000Z"
}]
```

Then run the render + publish steps manually (skip the fetch step).
