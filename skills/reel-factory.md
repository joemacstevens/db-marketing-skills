# Skill: Reel Factory

**Status:** Phase B expansion (2026-04-26). Absorbed from `db-reel-kit/README.md` + `AGENTS.md`. The original kit is staged in `_archive/db-reel-kit/`.

This skill is the end-to-end runbook for producing Different Breed reels — three pipelines, a publishing flow, a standard checklist, and the gotchas we've learned the hard way.

---

## Where things live: recipes vs. bytes

The OS folder is for **recipes** (small, git-tracked, the "how"). The Ajeo external drive is for **bytes** (large, the "what").

| Lives in OS (`db-marketing-skills-main/reels/`) | Lives on Ajeo (`/Volumes/Ajeo/.../Media Library/` or `_archive/media-to-ajeo/`) |
|---|---|
| `.fcpxml` project files | Raw `.MP4` / `.MOV` clips |
| Remotion `src/` (`.tsx` compositions, components, BrandStyles) | Rendered finals (`out/*.mp4`, `*.m4v`) |
| `package.json`, `tsconfig.json` | Remotion `public/` clip assets (after wrap) |
| `analysis/clip-analysis.json` (scene metadata) | Photo originals |
| `frames/` (small thumbnails for selection) | |
| `EDIT-GUIDE.md`, `BRIEF.md`, `README.md`, `JOURNAL.md` | |
| Music tracks (small, brand-relevant) | |

### Wrapped vs. active

A project is **active** while you're still cutting / iterating. Raw clips and outputs stay locally beside the project (FCP especially needs raw files present — symlinks beach-ball it).

A project is **wrapped** when the reel is delivered and you don't expect to re-render. At that point:
1. Move `raw-clips/` (or `*.MP4` files), `public/`, and `out/` into `_archive/media-to-ajeo/<original-path>/` (workspace staging area).
2. Drop a `WHERE-IS-IT.md` in the now-empty directory pointing to the Ajeo path.
3. Joey periodically flushes `_archive/` to `/Volumes/Ajeo/.../_archive/` (drag-and-drop, or rsync — see `_archive/README.md`).

To **reopen a wrapped project**, mount Ajeo, copy the bytes back into the project folder, and `npm install` if needed.

### What never leaves the OS
- `.fcpxml` and Remotion source — that's the recipe
- `package.json` — needed to regenerate `node_modules`
- The brief, edit guide, and any journals — institutional memory

### What never enters git
- `node_modules/` — gitignored at the top level; regenerable
- `out/` after wrap — gone to Ajeo
- `raw-clips/` — gitignored within FCP project pattern; goes to Ajeo when wrap

This split is what keeps the OS lightweight enough to live in git while the actual media bytes stay on the right storage tier.

---

## When to use this skill

Anytime you're producing a video reel for IG or FB. Three pipelines exist; pick the right one.

| Pipeline | When to use |
|---|---|
| **A. Remotion** (preferred for structured reels) | Schedule cards, animated text, weekly highlights, class promos, anything caption-heavy or that you'll iterate on. |
| **B. Final Cut Pro** (preferred for raw-footage reels) | Sparring montages, kids-boxing energy reels, behind-the-scenes, coach spotlights — anything mostly real footage cut to music. |
| **C. HTML + Playwright** (carousel covers, title cards) | Single-frame magazine-cover assets rendered as PNG → MP4. Not for full reels. |

---

## Pipeline A — Remotion

**Active project:** `reels/` (root of this repo). Has 14 cinematic-effect components and BrandStyles.ts already wired.

### Build a new composition
1. Add `reels/src/<NewReel>.tsx` — copy from an existing one (e.g., `JustWork15.tsx` or `WhatPeopleSay30.tsx`).
2. Register it in `reels/src/Root.tsx`.
3. Pull cinematic effects from `reels/src/cinematic-effects/` — see `skills/cinematic-effects.md` for the lookup table.
4. Use `reels/src/components/BrandStyles.ts` for colors, fonts, dimensions, safe zones (no magic numbers — pull from there).

### Preview & render
```bash
cd reels
npm run studio                                  # http://localhost:3000 — interactive preview
npx remotion render src/index.ts <CompositionId> out/<filename>.mp4
```

### Specs
- 1080×1920 vertical (9:16), 30fps
- Typical length: 15–45 seconds
- Brand colors from `brand-kit/brand.json` — never guess

---

## Pipeline B — Final Cut Pro

**Active home:** `reels/fcp-projects/<slug>/` (Phase C will populate as we re-import existing projects).

### Project structure
```
reels/fcp-projects/<slug>/
├── <slug>.fcpxml             ← the FCP project file
├── raw-clips/                 ← gitignored. Real files only — NEVER symlinks (FCP beach-balls on SMB symlinks)
├── analysis/clip-analysis.json   ← scene breakdown / clip selection notes
├── frames/                    ← thumbnails for selection
└── EDIT-GUIDE.md              ← copy from templates/new-reel/FCP-EDIT-GUIDE-TEMPLATE.md
```

### Edit-guide template
`templates/new-reel/FCP-EDIT-GUIDE-TEMPLATE.md` — describes clip order, timecodes, captions, music picks, post copy.

### Critical
- **No symlinks** to SMB footage (Ajeo). Copy real files into `raw-clips/`. We've burned hours on FCP beach-balling on symlinks.
- Music tracks: hip-hop instrumentals only. Track license info goes in the project's notes.

---

## Pipeline C — HTML + Playwright

For carousel covers, title cards, magazine-style single frames.

- Template: `templates/html-card/`
- Style: dark background, Oswald uppercase headline, red accent tags, photo fills top half, "EVOLVE INTO GREATNESS" footer bar.
- Render: open the HTML in Playwright, screenshot at 1080×1080 (carousel) or 1080×1920 (title card / story).

See also: `skills/creative-designer.md` for the broader HTML-to-PNG pipeline conventions.

---

## House style (the whole job)

The full visual + editorial style guide lives at `brand-context/visual-style-guide.md`. Read it. The short version:

- Bold magazine-cover energy. Dark bg, Oswald uppercase headlines, DB Red as emphasis only.
- 1080×1920, 30fps. IG safe zones: 220px top + 330px bottom clear of critical text.
- Captions burned in, word-level timed (Whisper).
- Music: instrumental hip-hop only. Duck to 15% under VO.
- End card always present in last 2 seconds.
- Voice: gritty, motivational, coach talking to athletes. Never corporate.

---

## Voiceover (ElevenLabs)

- **Voice ID:** `qVpGLzi5EhjW3WGVhOa9` (DB house voice — confident, direct, coach-in-your-ear).
- **Script tightness:** ≤3 words per second of video.
- **Generate:** `node scripts/generate-vo.mjs "Your script text" out/vo.mp3`
- **API key:** `ELEVENLABS_API_KEY` in `~/Projects/utilities/claude-secrets/.env.openclaw-secrets`.

---

## Captions (Whisper)

Word-level timing — never estimate.

```bash
bash scripts/whisper-captions.sh out/vo.mp3        # produces out/vo.json with word-level timestamps
```

Style on screen: Oswald Bold 700, white, drop shadow, word-by-word pop-in. Key words emphasized in DB Red `#C4161C`.

---

## Publishing — Upload-Post SDK

All DB social posting goes through the `upload-post` npm SDK. Don't touch the Meta Graph API unless Upload-Post fails.

### Account
```
user:       dbelitefitness     (case-sensitive!)
platforms:  ['instagram', 'facebook']
plan:       professional (unlimited)
```
Profile connects IG, FB, Threads, and LinkedIn under one handle.

### Post a reel
```bash
node scripts/post-reel.mjs out/my-reel.mp4 "Caption text here with emojis 🥊"
```

The script:
1. Loads `UPLOAD_POST_API_KEY` from `~/Projects/utilities/claude-secrets/.env.openclaw-secrets`.
2. Calls `client.upload(videoPath, { user, platforms, title, instagram: { isReel: true } })`.
3. If async, polls `getStatus(requestId)` every 15s.
4. Logs to `~/Library/Logs/uploadpost-publish.jsonl` (or wherever Joey/Noah configured).

### SDK gotchas
- Constructor: `new UploadPost(apiKeyString)` — **pass the key string directly**, not an object.
- The parameter is `title`, NOT `caption`.
- The parameter is `user`, NOT `profile`.
- Video uploads go **async** — must poll `getStatus(requestId)` to confirm delivery.
- Profile names are **case-sensitive** (`dbelitefitness` not `DBElitefitness`).
- `instagramMediaType: 'STORIES'` posts as a Story; omit it (or use `isReel: true`) for a Reel.
- FB caption ≤255 chars. If your IG caption is longer, post them separately.
- **No delete API exists** — if you post wrong, delete in the app manually.
- **Never do test uploads to production.** ("test caption" posts have gone live before.)

---

## Approval gate (non-negotiable)

**Never publish without Joey's explicit "ship it" approval on the specific version.**

The pipeline is always:
1. Render the reel → save to `output/`
2. Show Joey a preview (path or URL) + draft IG caption + FB caption + tags + hashtags
3. **Wait** for explicit approval
4. Then call `post-reel.mjs`
5. Add the published reel to `content-calendar/calendar.json` with `media_type: "video"` and the file path under `media_paths`

---

## Standard reel workflow (11 steps)

1. **Brief.** Get topic + length + coach/class from Joey. Save to `templates/new-reel/BRIEF-TEMPLATE.md` → `campaigns/<campaign>/briefs/YYYY-MM-DD-topic.md` (or just `briefs/` if standalone).
2. **Source footage.** Joey drops clips, OR pull from the Ajeo media library at `/Volumes/Ajeo/Projects/Different Breed/Media Library/` (indexed at `_index/photos.json` and `_index/videos.json`). Use `skills/media-library.md` to query.
3. **Pick pipeline** (Remotion / FCP / HTML).
4. **Write captions / VO script.** Match the topic exactly. Don't mix activities.
5. **Render voiceover** (if needed): `scripts/generate-vo.mjs`.
6. **Generate captions** (word-level): `scripts/whisper-captions.sh`.
7. **Render reel** → `out/<topic>-v<n>.mp4`.
8. **Preview to Joey:** file path or local URL, draft IG caption, draft FB caption (≤255 chars), hashtags (max 5), coaches to tag.
9. **Wait for approval.** No exceptions.
10. **Post** via `scripts/post-reel.mjs` and add to `content-calendar/calendar.json`.
11. **Log it** — date, topic, IG URL, FB URL, what worked, what didn't. Either inline in the calendar entry or in a campaign reflection doc.

---

## Pre-publish checklist

Run through this mental list. If any is "no" — stop and fix it first.

- [ ] Joey gave explicit "ship it" approval on the specific version
- [ ] IG caption acceptable, FB caption ≤255 chars
- [ ] ≤5 hashtags on IG
- [ ] Correct coaches tagged in the caption (see `brand-context/coaches-and-staff.md`)
- [ ] Videographer credited (`@veteranwithacamera`) if his footage appears
- [ ] End card present (last 2s)
- [ ] Filename descriptive + versioned in `output/`
- [ ] Calendar entry created in `content-calendar/calendar.json`

---

## Things NOT to do

- ❌ Publish without Joey's approval
- ❌ Use symlinks into FCP projects (use real file copies)
- ❌ Exceed 5 hashtags on IG or 255 chars on FB
- ❌ Mix unrelated footage (e.g., Pilates reel with boxing B-roll). A real "Pilates for Men" post got pulled for this.
- ❌ Forget to credit `@veteranwithacamera` when his footage is used
- ❌ Post "test" captions to production
- ❌ Improvise on brand colors / fonts. Use `brand-kit/brand.json`.
- ❌ Touch Meta Graph API unless Upload-Post fails

---

## Voice when talking to Joey

- Concise. No filler.
- When previewing a reel: file path, draft IG caption, draft FB caption, list of tags/hashtags. Nothing else.
- When posting: confirm IG URL + FB URL + a one-line status.

---

## Cross-references

- **Brand context** — `brand-context/visual-style-guide.md` (full style guide), `brand-context/coaches-and-staff.md` (who to tag), `brand-context/hashtags.json` (hashtag sets by topic), `brand-context/posting-rules.md` (platform limits)
- **Brand assets** — `brand-kit/logos/`, `brand-kit/fonts/`, `brand-kit/brand.json`
- **Cinematic effects lookup** — `skills/cinematic-effects.md`
- **Media library queries** — `skills/media-library.md`
- **Content calendar** — `skills/content-calendar.md`
- **Post publisher details** — `skills/post-publisher.md`
