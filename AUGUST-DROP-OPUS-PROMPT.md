# August Drop — Opus Handoff Prompt

Paste everything below the line into a fresh Opus session opened in this project (`/Users/joestevens/Projects/Different Breed`). Optionally attach the two flyer PNGs (UBE Challenge + DB Run Club) for visual reference; all flyer copy is transcribed inside so the prompt works without them.

Full planning context lives at `/Users/joestevens/.claude/plans/i-want-you-to-smooth-flame.md`.

---

You are building the August content drop for Different Breed Elite Fitness. Two projects, four deliverables: a lobby TV panel + an IG announce reel for the **August UBE Challenge**, and a lobby TV panel + an IG announce reel for the new **DB Run Club**. Everything below has been scoped and approved by Joey — execute it, and stop at the approval gates. Read `brand-context/writing-rules.md` before writing ANY copy (no em-dashes, no rhetorical questions, no antithesis, mixed sentence lengths, warm endings, lowercase hashtags, specificity over vagueness).

# SOURCE MATERIAL (approved flyer copy, transcribed)

**UBE CHALLENGE flyer:** "DIFFERENT BREED UBE CHALLENGE — Upper Body Ergometer Challenge. POWER. PUSH. PERFORM. How far can you go in 30 or 40 seconds? It's all about speed, strength and explosive power. CAN YOU OUT-PUSH THE REST? FURTHEST DISTANCE WINS! The challenge: use the UBE and go as far as you can. It's you against the clock and the board. WOMEN 30 SECONDS / MEN 40 SECONDS. Challenge runs August 1–31. Open to all members. One winner: top distance in your respective category. SPIN THE WHEEL FOR YOUR PRIZE! PUSH HARD. GO FURTHER. BE DIFFERENT."

**DB RUN CLUB flyer:** circular badge "BUILT DIFFERENT · DB RUN CLUB · ONE MILE AT A TIME." Tagline "Built Different: One Mile at a Time." Body: "DB Run Club is more than a running club. It's a community of people committed to becoming stronger, healthier, and more confident together. And when we race, we race as Built Different." Pillars: ALL PACES. ALL PEOPLE. / STRONGER TOGETHER (physical, mental, emotional) / GOALS. GROWTH. DISCIPLINE. (effort over perfection) / SUPPORT. COMMUNITY. BELONGING. (we run together, we race together) / PLANNED ROUTES. Schedule: EVERY WEDNESDAY, DURING SUNRISE STRENGTH CLASS. Sign-off: "MEET. MOVE. BUILD DIFFERENT."

Facts: Sunrise Strength = Wed 5:30 AM, Coach Michelle Buttafuoco (@mishbutta — confirmed, credit her; IG tagging is MANUAL in-app after publish, never via API). First Run Club: Wednesday Aug 5. UBE scoring: distance (meters), descending, one winner per division. Decisions already made: Run Club reel is graphics-forward (no forced gym footage); do NOT touch the `member-challenge-ideas` panel; music = new ElevenLabs hip-hop instrumentals, NOT the DB anthem.

# PART 1 — LOBBY PANELS (main-site/, its own git repo db-main-site, Vercel auto-deploys on push to main)

Architecture you must follow: bespoke panels live in `main-site/src/lib/components/lobby/`, register in `registry.ts` `byId`, and ride a generic `panelType` in JSON so the admin editor works. Seed file `main-site/src/lib/data/lobby-panels.json` (commit both new entries with `"enabled": false`); production truth is Vercel Blob `lobby-config/panels.json`. `/lobby/preview/<id>` renders from seed even while disabled. Panels animate **transform/opacity only** (Fire Stick); use `effects/reveal.ts` for staggers. `holdMs` must equal the internal frame-loop total exactly.

## 1a. PanelUbeChallenge.svelte — id `ube-challenge`, panelType `"leaderboard"`

Copy the structure of `PanelKettlebellCarry.svelte` (two-column: left content / right media with crossfade + kenburns) and the internal setTimeout frame-loop pattern from `PanelRingsideRiddle.svelte`. Left column is a 3-frame loop, right column persists; `holdMs: 28000`:
- **Frame A, 6s (HOOK):** kicker DIFFERENT BREED ELITE FITNESS → red italic AUGUST CHALLENGE → lockup: UBE (bone NORD ~96px) over CHALLENGE (red NORD italic ~152px, hard 4px black offset) → mono UPPER BODY ERGOMETER → red-ruled strip POWER. PUSH. PERFORM. → hook HOW FAR CAN YOU GO IN 30 OR 40 SECONDS? with a red bar draining left-to-right over the full 6s (CSS scaleX 1→0, transform-origin left).
- **Frame B, 14s (BOARD):** compact header, subtitle from `leaderboard.subtitle`, two division cards — WOMEN / 30 SEC · FURTHEST DISTANCE first, then MEN / 40 SEC. Rows rank/name/score with a small M suffix; empty state "First sprint goes up here." Footer: FURTHEST DISTANCE WINS.
- **Frame C, 8s (PRIZE):** eyebrow AUGUST 1–31 · OPEN TO ALL MEMBERS → SPIN THE WHEEL / FOR YOUR PRIZE (red highlight on WHEEL) → code-drawn SVG prize wheel, 8 wedges alternating red/#1F1F1F/bone/gold, slow continuous CSS rotate → chips TOP DISTANCE · MEN and TOP DISTANCE · WOMEN → strip PUSH HARD. GO FURTHER. BE DIFFERENT. → mono LOG YOUR DISTANCE AT THE FRONT DESK.

Score parsing: do NOT copy `parseLaps`' parseInt — strip commas, parseFloat, sort descending (matches admin `higherWins: true`). Right-column fallback when no uploads: cycle `/photos/ube-challenge-1.jpg` and `-2.jpg` with the same crossfade. No QR on this panel (challenge-panel precedent).

Seed entry (insert right after `kettlebell-winners`):
```json
{
  "id": "ube-challenge",
  "panelType": "leaderboard",
  "className": "UBE Challenge",
  "kicker": "AUGUST CHALLENGE",
  "tagline": "Power. Push. Perform.",
  "coachSlugs": [], "classSlugs": [],
  "holdMs": 28000, "repeatEveryPanels": 2, "photoHoldMs": 2000,
  "leaderboard": { "subtitle": "Women 30 sec · Men 40 sec · furthest distance wins", "rows": [] },
  "enabled": false,
  "enabledNote": "Ships disabled — flip on via scripts/golive-august-panels.mjs.",
  "notes": "Bespoke component (PanelUbeChallenge) registered by id. August 2026 challenge: women sprint 30s, men 40s on the upper body ergometer, score = distance in meters, descending, one winner per division, winner spins the prize wheel. 3-frame loop (hook 6s / board 14s / prize 8s = holdMs 28000). Static fallbacks /photos/ube-challenge-1.jpg + -2.jpg.",
  "uploadedPhotos": []
}
```

Admin wiring: in `main-site/src/routes/admin/panels/[id]/+page.svelte` add to SPLIT_BOARDS (~line 31): `'ube-challenge': { scoreLabel: 'Distance', scorePlaceholder: 'meters', higherWins: true }`. Register in `registry.ts` byId.

Static fallback art — the media library has ZERO UBE photos, so frame-grab from video (HDR-tonemap mandatory, clips are iPhone HLG/DV):
```bash
source scripts/hdr-tonemap.sh
CLIP="/Volumes/Ajeo/Projects/Different Breed/Media Library/July 2026 - Don Clips/2026-07-13_1145_don_IMG_8612.mov"
vf=$(tonemap_prefix "$CLIP")
ffmpeg -ss 27.0 -i "$CLIP" -vf "$vf" -frames:v 1 -q:v 2 main-site/static/photos/ube-challenge-1.jpg
CLIP="/Volumes/Ajeo/Projects/Different Breed/Media Library/January 8, 2026/IMG_2704.mov"
vf=$(tonemap_prefix "$CLIP")
ffmpeg -ss 6.0 -i "$CLIP" -vf "$vf" -frames:v 1 -q:v 2 main-site/static/photos/ube-challenge-2.jpg
```

## 1b. PanelRunClub.svelte — id `run-club`, panelType `"announcement"`

Bespoke byId component riding `announcement` (admin gets headline/body). 3-frame loop, `holdMs: 30000`:
- **Frame 1, 8s (BADGE):** background `/photos/run-club-road.jpg` (generated sunrise-road art, dark scrim ~70%, slow kenburns) with the circular badge **code-drawn as inline SVG** (NOT generated art): outer red ring with `<textPath>` reading BUILT DIFFERENT · DB RUN CLUB · ONE MILE AT A TIME in NORD letterspaced caps; center big DB in NORD black italic over a red skewed band reading RUN CLUB. Below: BUILT DIFFERENT: ONE MILE AT A TIME.
- **Frame 2, 12s (PILLARS):** headline MORE THAN A RUNNING CLUB. then the five flyer pillars stagger in via `effects/reveal.ts`, alternating plain row / red-band row, subs in Barlow lowercase. Close with WHEN WE RACE, WE RACE AS BUILT DIFFERENT.
- **Frame 3, 10s (SCHEDULE + QR):** EVERY WEDNESDAY huge NORD italic red → DURING SUNRISE STRENGTH · 5:30 AM → coach chip using existing `static/photos/coach-michelle-card.jpg` (circle crop) + COACH MICHELLE + mono @mishbutta → if `schedule[0]` present show a NEXT RUN date chip, else static copy → QR card rendering `panel.qrSvg` + `cta` lines → MEET. MOVE. BUILD DIFFERENT.

Seed entry (insert right after `sunrise-strength`):
```json
{
  "id": "run-club",
  "panelType": "announcement",
  "theme": "ink",
  "className": "DB Run Club",
  "kicker": "EVERY WEDNESDAY · 5:30 AM",
  "tagline": "Built Different: One Mile at a Time.",
  "coachSlugs": ["michelle"], "classSlugs": [],
  "holdMs": 30000, "repeatEveryPanels": 3,
  "linkUrl": "https://www.mindbodyonline.com/explore/fitness/classes/sunrise-strength-different-breed-sports-academy",
  "scheduleFilter": { "classDescriptionIds": [94] },
  "announcement": {
    "headline": "DB RUN CLUB",
    "body": "DB Run Club is more than a running club. It's a community of people committed to becoming stronger, healthier, and more confident together. And when we race, we race as Built Different."
  },
  "cta": { "kicker": "SCAN TO BOOK WEDNESDAY", "lines": ["runs during sunrise strength", "5:30 am · coach michelle"] },
  "enabled": false,
  "enabledNote": "Ships disabled — flip on via scripts/golive-august-panels.mjs.",
  "notes": "Bespoke component (PanelRunClub) registered by id; rides announcement so the admin editor works. 3-frame loop (badge 8s / pillars 12s / schedule 10s = holdMs 30000). Badge is code-drawn SVG. QR via linkUrl to the Sunrise Strength MindBody page (classDescriptionId 94, Wed 5:30 AM, Coach Michelle Buttafuoco).",
  "uploadedPhotos": []
}
```

The `linkUrl` matters: `/lobby/scan/[panelId]` reads the committed seed only, so pointing the QR at MindBody sidesteps that route entirely while making the scan genuinely useful (book Wednesday's class).

## 1c. Go-live script — `scripts/golive-august-panels.mjs` (repo root)

Model it line-for-line on `scripts/golive-fritz-crown.mjs`: env from `main-site/.env.local`, login `POST ${BASE}/api/admin/login` with ADMIN_PASSWORD, BASE default `http://localhost:5174`, `--dry` prints the op plan without writing. House rule: ALL panel-data writes through the admin API (`POST mode:'create'`, `PATCH {id, patch}`, `POST mode:'reorder'` at `/api/admin/panels`) — no direct Blob puts. Read live state read-only from Blob (`list({prefix:'lobby-config/panels.json'})` + cache-busted fetch, like `main-site/scripts/add-kettlebell-winners-panel.mjs` does).

Logic (idempotent — the Aug 1 kettlebell-winners script may or may not have already run, so branch on LIVE state, never assume the seed reflects prod):
1. Fetch live panels; record state of kettlebell-carry / kettlebell-winners / ube-challenge / run-club.
2. kettlebell-winners: absent → create from seed with enabled:true; disabled → PATCH enabled:true.
3. kettlebell-carry: enabled → PATCH `{enabled:false, enabledNote:"July challenge closed 7/31 — superseded by kettlebell-winners + ube-challenge."}`.
4. ube-challenge + run-club: create from seed entries with enabled:true, enabledNote dropped.
5. Reorder: ube-challenge after kettlebell-carry, kettlebell-winners after ube-challenge, run-club after sunrise-strength; everything else keeps live order.
6. Re-fetch and assert end state (carry OFF, winners ON, both new panels ON exactly once, order correct), printing PASS/FAIL per check.

**Operational order (never violate): commit + push main-site code FIRST, wait for the Vercel deploy, verify prod previews, THEN run the go-live script.** Data-before-code renders the new ids as generic PanelDefault on the TV. TV propagates in ~90s.

# PART 2 — REELS (reels/ Remotion project, 1080×1920 @30fps)

House rules: 1.5s cold open with no type; 1.5s (45f) title cards; hard cuts + red FlashWipe, NO fade-to-black; total 20–30s; SAFE = {top:210, bottom:420, sides:120} so usable width is 840px — build local title cards at ≤128px NORD (StampTitle's 168px line2 clips); leaderboard/prize cards are their own graphic cards, never captioned onto a person; end tag = no logo, eyebrow + red dashes → big NORD lines → red skewed banner CTA → front-desk sub-line → red @DBELITEFITNESS. Import from `reels/src/design-system/` (call `useDBSFonts()` first) and `reels/src/celebrate/kit.tsx` (Slam, Ribbon, SlashLabel, Backdrop, CardGround, NameChip, FlashWipe, EndCard, bedVolume). Anything from `reels/src/cinematic-effects/` defaults to the LEGACY palette (#C4161C/Oswald) — always pass explicit DBS_COLORS/NORD props. Register each comp in `reels/src/Root.tsx` under the August-2026 folder; export `{ Component, DURATION }`.

## 2a. Footage prep (UBE reel) — every clip is iPhone HEVC HDR; tonemap every trim:
```bash
source scripts/hdr-tonemap.sh   # then per clip: vf=$(tonemap_prefix "$CLIP"); ffmpeg -ss <in> -to <out> -i "$CLIP" -vf "$vf" ... reels/public/ube-challenge/<name>.mp4
```
| Local file (reels/public/ube-challenge/) | Source (Media Library root) | Trim |
|---|---|---|
| open.mp4 | July 2026 - Don Clips/2026-07-13_1145_don_IMG_8612.mov | 25.0–32.6s (UBE segment) |
| women.mp4 | January 8, 2026/IMG_2704.mov | 1.0–13.0s (keep natural trainer audio) |
| push.mp4 | 2026/5-13-Bundle/Its Just Work V2/IMG_6195.mov | 0.5–9.5s |
| grind.mp4 | August 26, 2025/IMG_5391.mov | 2.0–6.0s (ALWAYS muted — unrelated speech) |

NEVER use `January 24, 2026/IMG_3033.mov` — it's a ski erg, wrong machine. Let ffmpeg auto-rotate IMG_8612 (rotation metadata), don't transpose.

## 2b. UbeChallenge.tsx — `UBE_CHALLENGE_DURATION = 750` (25s), comp id `UbeChallengeAug`
Frame plan (nudge every cut to the aubiotrack grid once music is picked; paste the sec→frame(×30) table into the header comment):
- 0–48 COLD OPEN: open.mp4, pure footage.
- 48–138 TITLE: same clip runs; kicker chip AUGUST CHALLENGE; THE UBE (bone ~88px) / CHALLENGE (red italic wipe, ≤128px); sub POWER. PUSH. PERFORM.
- 138–243 RULES WOMEN: women.mp4; lower-third WOMEN + huge red 30 SEC; red timer bar drains scaleX 1→0 across the beat; persistent kicker HOW FAR CAN YOU GO?
- 243–348 RULES MEN: push.mp4; MEN + red 40 SEC, same draining bar.
- 348–420 SLAM: grind.mp4 muted; FURTHEST / DISTANCE / WINS. (red on DISTANCE), FlashWipe in.
- 420–558 WHEEL CARD (own graphic card): eyebrow AUG 1–31 · OPEN TO ALL MEMBERS + red dashes; WIN YOUR DIVISION; SPIN THE WHEEL / FOR YOUR PRIZE; code-drawn SVG wheel spins in with spring deceleration; chips TOP DISTANCE MEN / TOP DISTANCE WOMEN.
- 558–648 TEASE: women.mp4 later segment; lower-third YOUR NAME / GOES ON THE BOARD.
- 648–750 END CARD: eyebrow AUGUST CHALLENGE · ALL MONTH → PUSH HARD. / GO FURTHER. / BE DIFFERENT. → red banner GET ON THE BOARD → sub "log your distance at the front desk" → @DBELITEFITNESS.
Audio: ElevenLabs bed full except duck to ~0.3 under women.mp4's natural trainer audio (frames 138–243) via a volume fn / bedVolume; fade out by 750. No VO.

## 2c. RunClub.tsx — `RUN_CLUB_DURATION = 750` (25s), comp id `RunClubAug`
Graphics-forward by decision. The 1.5s-footage opener rule is intentionally adapted: open on pure generated art in motion (no type) instead of splicing unrelated gym footage. Build the badge once as `reels/src/run-club/RunClubBadge.tsx` (React SVG, circular textPath, real NORD) and reuse its geometry for the panel's badge.
- 0–45 COLD OPEN: art-road-sunrise.png full-bleed, slow zoom 1.0→1.08 + drift, grain, zero type.
- 45–135 BADGE: hard cut to black; RunClubBadge slams in (spring overshoot), ring rotates slowly; below: BUILT DIFFERENT: ONE MILE AT A TIME.
- 135–195 STATEMENT: ink card MORE THAN A / RUNNING CLUB. (SkewHighlight on RUNNING), asphalt texture at ~8% behind.
- 195–435 PILLARS ×5 (48f each, FlashWipe between, over a KineticMarquee loop of "ONE MILE AT A TIME ·" with explicit DBS colors/fonts): ALL PACES. ALL PEOPLE. → STRONGER TOGETHER (sub physical · mental · emotional) → GOALS. GROWTH. / DISCIPLINE. (sub effort over perfection) → SUPPORT. COMMUNITY. / BELONGING. (sub we run together, we race together) → PLANNED ROUTES. (over road art).
- 435–510 RACE LINE: red full-bleed card WHEN WE RACE, / WE RACE AS / BUILT DIFFERENT. (knockout black on red).
- 510–630 SCHEDULE CARD: EVERY WEDNESDAY huge NORD italic → DURING SUNRISE STRENGTH → 5:30 AM roll-in → COACH MICHELLE chip + @mishbutta.
- 630–750 END CARD: eyebrow FIRST RUN · WEDNESDAY AUG 5 + red dashes → MEET. MOVE. / BUILD DIFFERENT. → red banner RUN WITH US WEDNESDAY → sub "book sunrise strength · 5:30 am" → @DBELITEFITNESS.

## 2d. Generated art — how to generate images
Use `node scripts/gemini-image.mjs "prompt" --out <file> [--aspect 9:16|16:9|1:1] [--count N] [--ref img.png ...] [--model gemini-3-pro-image-preview --size 2K]`. Env GEMINI_API_KEY comes from the secrets file the script already loads. Default model `gemini-2.5-flash-image` is right for textures/photography; switch to `gemini-3-pro-image-preview` ONLY if art must contain typography (it won't here — all type is code). `--ref` conditions style on existing brand images. Retries 429/5xx automatically. If you ever need a transparent PNG: generate the SAME subject twice (once on pure white bg, once on pure black), then alpha-extract per the nano-transparent-bg technique — never trust a "transparent-looking" single render. Do NOT regenerate existing brand assets (seals, wordmark, NORD anything).
```bash
node scripts/gemini-image.mjs "Empty asphalt road at sunrise shot low to the ground, long dramatic shadows, deep red and gold glow on a dark moody horizon, gritty 35mm film photography, high contrast, no people, no text, no watermarks" --out reels/public/run-club/art-road-sunrise.png --aspect 9:16 --count 2
node scripts/gemini-image.mjs "<same prompt>" --out main-site/static/photos/run-club-road-src.png --aspect 16:9   # → convert/compress to run-club-road.jpg
node scripts/gemini-image.mjs "Overhead macro of worn dark asphalt with one faded painted red line crossing the frame, gritty texture, near black, high contrast, no text" --out reels/public/run-club/art-asphalt.png --aspect 1:1
```
Pick the best road candidate yourself; keep the runner-up on disk.

## 2e. Music — ElevenLabs, no DB anthem
One take per invocation (run each prompt, then again for take 2). NEVER name artists/producers (the API 400s; the error body returns a sanitized prompt_suggestion — resubmit that verbatim if it happens).
```bash
# UBE (pick boom-bap vs trap after scoring)
node scripts/generate-music.mjs "Hard instrumental hip-hop workout beat, 92 BPM boom bap, punchy kick and cracking snare, gritty bass, vinyl texture, sparse brass stabs, intensity rises every four bars, strong downbeat intro, hard clean ending hit" reels/public/ube-challenge/beat-boombap-1.mp3 --ms 27000
node scripts/generate-music.mjs "Dark trap instrumental, 140 BPM, heavy 808 slides, fast hi-hat rolls, menacing minimal synth line, gym hype energy, hard drop around four seconds in, no vocals, clean ending" reels/public/ube-challenge/beat-trap-1.mp3 --ms 27000
# Run Club (running-cadence pulse, 96–100 BPM)
node scripts/generate-music.mjs "Uptempo instrumental boom bap hip-hop, 96 BPM, steady driving drums with a running-cadence feel, warm bass, chopped soul horn stabs, gritty and motivational, no vocals, clean ending" reels/public/run-club/beat-cadence-1.mp3 --ms 27000
node scripts/generate-music.mjs "Instrumental hip-hop with a pulse like footsteps, 100 BPM, tight kick pattern, driving hats, deep sub bass, triumphant horn accent entering halfway, no vocals, clean ending" reels/public/run-club/beat-stride-1.mp3 --ms 27000
# Score + pick per reel:
node scripts/gemini-music.mjs reels/public/ube-challenge/beat-*.mp3 --prompt "Pick the take that hits hardest for a 25s gym challenge reel with hard cuts on the beat; call out the best downbeat to open on"
node scripts/gemini-music.mjs reels/public/run-club/beat-*.mp3 --prompt "Pick the take with the steadiest running pulse and clearest beat grid for cutting five fast type cards"
aubiotrack <winner>.mp3   # transcribe the grid into the comp header as sec → frame (×30); snap cuts to it
```
Never trust Gemini for speech timing (documented fabrications); there is no VO in either reel so whisper isn't needed.

# PART 3 — CAPTIONS + CALENDAR (content-calendar/calendar.json)

Add two entries with `status: "draft"` (Joey flips them). Campaign slugs exactly `ube-challenge` and `run-club` (one slug per project — July drifted across three, don't repeat that). Top-level `media_type: "video"`; REELS lives only in `instagram_options.media_type`. fb_caption ≤255 chars. ≤5 lowercase hashtags. Model the entry shape on `2026-07-01-001-kettlebell-carry-launch`.

**`2026-08-02-ube-challenge-launch`** (post today 13:30 if approved, else tomorrow 11:00):
ig_caption: "August challenge is live, and this one is pure output. The UBE test. You get one sprint on the upper body ergometer, 30 seconds for women, 40 for men, and the only number that counts is how far the meter reads when time runs out. Furthest distance in each division takes the month, and both winners spin the wheel for their prize.\n\nIt runs August 1 through 31, it's open to every member, and you can retry all month, so warm up those shoulders and come put a number up.\n\n#differentbreed #ubechallenge #augustchallenge #teaneck #njfitness"
fb_caption: "August challenge is the UBE test. Women sprint 30 seconds, men 40, furthest distance wins your division and the winner spins the prize wheel. Runs August 1 through 31, open to all members. Come put a number up."
first_comment: "One winner per category, top distance men and top distance women. Log your attempt at the front desk."
media_paths → the rendered reel under output/. credit_videographer: false.

**`2026-08-03-run-club-launch`** (post Mon Aug 3, 18:00 — prime evening, ~36h before the first run):
ig_caption: "DB Run Club starts this Wednesday, August 5. We run during the 5:30 am Sunrise Strength class with Coach Michelle, planned routes, all paces, all people. It's a community working on getting stronger, healthier, and more confident together, and when we race, we race as Built Different.\n\nEvery Wednesday from here on. Come meet us, move with us, and build different one mile at a time.\n\n#differentbreed #dbrunclub #teaneck #runclub #njfitness"
fb_caption: "DB Run Club starts Wednesday, August 5. We run during the 5:30 am Sunrise Strength class with Coach Michelle, planned routes, all paces welcome. One mile at a time."
first_comment: "Coach Michelle leads it. Book Wednesday's Sunrise Strength class and you're in."
notes MUST include: tag @mishbutta manually in the IG app after posting (one bad handle rejects the whole post via API — never automate member/coach tags).

# PART 4 — VERIFY, REVIEW, GO LIVE (in this order, with hard stops)

1. **Build + local preview.** `cd main-site && npm run dev` → check `http://localhost:5173/lobby/preview/ube-challenge` and `/lobby/preview/run-club` (SEED banner is expected): loop timings match holdMs, empty board state, wheel + badge rotation smooth, Michelle chip, QR renders. Check `/admin/panels/ube-challenge` shows the Distance split-board. `cd reels && npx remotion studio` to scrub both comps against the beat grid.
2. **Render.** `npx remotion render src/index.ts UbeChallengeAug out/ube-challenge-launch.mp4 --concurrency 4` and `RunClubAug → out/run-club-launch.mp4`. Grab stills at each beat with `npx remotion still`.
3. **Review packages.** `output/2026-08-02-ube-challenge/` and `output/2026-08-02-run-club/`: mp4(s), still-*.png per beat, panel preview screenshots, captions.md. Present both to Joey.
4. **STOP — Joey approves** design/renders/music/captions. Nothing goes live or publishes without his explicit go.
5. **Panel go-live (after approval).** Commit + push db-main-site → wait for Vercel → verify PROD previews → `cd main-site && npm run dev -- --port 5174` (holds the prod Blob token) → `node scripts/golive-august-panels.mjs --dry` → review → run live → confirm the end state assertions pass → check the lobby TV (~90s).
6. **Publish (after approval).** Flip calendar entries to approved, publish via `node content-calendar/publish.mjs --id <id>` (or --schedule), then remind Joey to tag @mishbutta manually in-app on the Run Club post. Log post_result. Commit the marketing-repo changes (calendar, scripts, reels src, output/) with a clear message.

# GOTCHAS (each one has burned us before)
- Fire Stick: transform/opacity animations only in panels; only active+next media frames get real src.
- Push code before patching data, always. Check LIVE Blob state before go-live (the Aug 1 winners script may already have run).
- holdMs must equal the panel's internal loop total or the rotation cuts frames mid-sequence.
- HDR tonemap every trim AND frame grab or footage washes out. Auto-rotate, never transpose.
- SAFE sides 120 → 840px usable; local title cards ≤128px.
- cinematic-effects default to the legacy #C4161C/Oswald — pass DBS props explicitly.
- Calendar media_type enum: "video" (not "image", not "REELS" at top level).
- No em-dashes anywhere in copy or on-screen text. Read brand-context/writing-rules.md first.
- Never name artists in ElevenLabs prompts. One take per invocation.
- IMG_3033 is a ski erg (wrong machine). IMG_5391 stays muted.
