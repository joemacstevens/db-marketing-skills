# DB Summer Camp 2026 — Passdown

Last updated: 2026-04-08

## What's live right now

- **Landing page:** https://summer.differentbreedsportsacademy.com
  - Source: `landing-page/index.html` (single file)
  - Hosted on Vercel project `db-summer-camp-2026` (team `joemacstevens-projects`)
  - Cinematic modules wired in: Curtain Reveal hero, Odometer proof bar, Horizontal Scroll Hijack for the 5 programs (init script at the bottom of `index.html`, GSAP+ScrollTrigger via CDN in `<head>`)
  - Horizontal scroll height formula: `Math.round(getDist() * 1.7 + window.innerHeight)` — slows the pan and prevents trailing whitespace
  - Form posts to `landing-page/api/register.js` (Vercel serverless function)

- **Flyer gallery (client review URL):** https://db-summer-camp-flyer-preview-cko7l31q7-joemacstevens-projects.vercel.app
  - Source: `output/index.html` (gallery), `output/flyer-collage.html` (full 8.5×11), `output/flyer-collage-half.html` (5.5×8.5)
  - Hero hook: **"Where Skills Turn to Confidence."**
  - QR code on both flyers points to `summer.differentbreedsportsacademy.com`
  - Render command:
    ```bash
    export PATH="/opt/homebrew/bin:$PATH"
    node -e "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();for(const [f,w,h] of [['output/flyer-collage.html',2550,3300],['output/flyer-collage-half.html',1650,2550]]){const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1});const p=await ctx.newPage();await p.goto('file://'+process.cwd()+'/'+f);await p.waitForLoadState('networkidle');await p.screenshot({path:f.replace('.html','.png')});}await b.close();})();"
    ```

## Active task: flyer brightness + bleed (in progress)

### Don's feedback (received via iMessage screenshot, 2026-04-08)
1. Photos in **top-left (Agility)** and **top-right (Strength)** print too dark
2. The bottom-right **Power** photo also reads dark
3. Flyer didn't print **edge-to-edge** on Don's printer

### What's been done so far
**Brightness fix** — applied per-slot CSS filters in `output/flyer-collage.html` and `output/flyer-collage-half.html`:

```css
.collage .photo:nth-child(1) img { object-position: center 40%; filter: brightness(1.65) contrast(1.08) saturate(1.05); }  /* Agility */
.collage .photo:nth-child(2) img { object-position: center 30%; filter: brightness(1.28) contrast(1.10) saturate(1.05); }  /* Strength */
.collage .photo:nth-child(3) img { object-position: center 50%; filter: brightness(1.05) contrast(1.05); }                  /* Basketball */
.collage .photo:nth-child(4) img { object-position: center 35%; filter: brightness(1.70) contrast(1.08) saturate(1.05); }  /* Power */
```

User manually bumped slots 1 + 4 from `1.35`/`1.40` → `1.65`/`1.70` after the first preview. PNGs re-rendered. Still need user sign-off after they preview the new render.

### Edge-to-edge / bleed — not yet built
The current file is a 2550×3300 PNG (8.5×11" at 300 DPI) with **no bleed**. Most home printers add ~3mm margin no matter what, so it physically can't print edge-to-edge from the user's printer. Two options pending Don's call:
- **A.** Tell Don to print at "Scale: 100% / Actual Size / Borderless" — works on some inkjets
- **B.** Build a print-shop version: 8.75×11.25" page with 0.125" bleed on all sides + crop marks. Print shops trim to 8.5×11 with art running off the edge. **Recommended.** Not built yet.

### Next steps (in order)
1. User previews the brighter PNGs (slots 1 + 4 at brightness 1.65/1.70) and approves
2. Build the bleed version (`flyer-collage-bleed.html` at 2625×3375 with 37.5px bleed) — same for half-size
3. Re-deploy the gallery with the new files
4. Send updated link to Don

## Photo asset map

The flyer uses these files (all in `output/`):
- `hero-camp.jpg` — Slot 1 (Agility) — agility hurdles, dim gym lighting
- `hero-mitts.jpg` — Slot 2 (Strength) — pushup line, file `gym_7_7_25-2686.jpg` from Ajeo drive (#46 in our contact sheet)
- `hero-drills-wide.jpg` — Slot 3 (Basketball) — outdoor basketball drive, file `gym_7_9_25-3501.jpg` (#88)
- `hero-pushups.jpg` — Slot 4 (Power) — slam ball action, file `gym_7_9_25-3013.jpg` (#74)

Source library (only available when Ajeo external drive is mounted):
`/Volumes/Ajeo/Projects/Different Breed/Media Library/2025/{Gym_7_7_25,Gym_7_9_25,Gym_7_18_25}`

Contact-sheet workflow (used to browse 142 July photos visually):
- Resized thumbnails: `/tmp/dbcs/001.jpg` … `142.jpg`
- Number → source path mapping: `/tmp/dbcs_index.txt`
- Visual contact sheets: `/tmp/dbcs/sheet1.png`, `sheet2.png`, `sheet3.png`

## Cinematic Effects → Remotion (2026-04-13)

**Status:** Phase 1 BUILT. Top-level shared project live. Pilot story composed.

Reviewed the feasibility study (`cinematic-site-components/REMOTION-FEASIBILITY-STUDY.md`) for converting the 30 RoboLabs HTML cinematic modules into reusable Remotion React components for DB marketing reels.

**Decision:** Build a `cinematic-effects/` component library inside the reels project + a new `skills/cinematic-effects.md` skill file as the AI lookup table.

**Plan:** `cinematic-site-components/IMPLEMENTATION-PLAN.md`
- Phase 1: 10 Tier 1 components (GlitchEffect, TextScramble, Typewriter, KineticMarquee, OdometerCounter, MeshGradient, TextMaskReveal, GradientStroke, SVGDraw, CircularText)
- Phase 2: 9 Tier 2 cinematic transitions (CurtainReveal, ZoomParallax, TextMaskVideo, ColorShift, StickyCards, HorizontalPan, SplitScreen, StickyStack, ViewTransitionMorph)
- Phase 3: 5 Tier 3 scripted beats (on-demand only)
- Pilot reel: Summer Camp 2026 announcement rebuilt with CurtainReveal + TextMaskVideo + OdometerCounter + GlitchEffect

**Key technical notes:**
- No GSAP in Remotion — everything via `interpolate()` and `spring()`
- DB brand colors (red/black/white) and fonts (Oswald/Inter) baked as defaults
- Every component follows the same contract: `startFrame`, `endFrame`, brand color overrides
- Existing reels project is at `campaigns/summer-camp-2026/reels/` (Remotion 4.0.447, React 19)

**Decisions made (April 13):**
- Joey chose top-level shared `reels/` project (not campaign-specific)
- Summer Camp story for April 14 is the pilot reel
- Build order: Phase 1 → pilot → Phase 2

**What's built:**
- `reels/` — Top-level Remotion project (Remotion 4.0.448, React 19)
- `reels/src/cinematic-effects/` — 5 Phase 1 components:
  - `TextScramble.tsx` — character-by-character decode reveal
  - `GlitchEffect.tsx` — RGB channel split + scanlines + flash (wraps children)
  - `Typewriter.tsx` — character-by-character typing with blinking cursor
  - `KineticMarquee.tsx` — continuously scrolling text strip
  - `MeshGradient.tsx` — animated gradient blob background (wraps children)
- `reels/src/CampStoryApril14.tsx` — Pilot reel composition (~15.5s):
  - Scene 1: TextScramble "DB SUMMER CAMP" over MeshGradient
  - Scene 2: GlitchEffect burst + "IS BACK." punch-in
  - Scene 3: Action photo + Typewriter stats (Ages 11-16 / 9 Weeks / 5 Coaches)
  - Scene 4: CTA + KineticMarquee ticker
  - Scene 5: EndTagScene
- `skills/cinematic-effects.md` — AI lookup table: mood → component mapping
- Studio compiles cleanly: `cd reels && npm run studio`

**To render:** `cd reels && npm run render:camp-story`
**To preview:** `cd reels && npm run studio` → open http://localhost:3000

**Phase 2 BUILT (April 13):**
- 9 additional cinematic transition components:
  - `CurtainReveal.tsx` — two panels slide apart to reveal content
  - `ZoomParallax.tsx` — stacked images at different depths, zoom at different rates
  - `TextMaskVideo.tsx` — video plays inside text letterforms with reveal animation
  - `ColorShift.tsx` — background color interpolates across frame ranges
  - `StickyCards.tsx` — cards enter + stack with slight offset (schedules/lists)
  - `HorizontalPan.tsx` — wide content strip pans across viewport
  - `SplitScreen.tsx` — two halves animate in from opposite sides
  - `StickyStack.tsx` — foreground pinned while backgrounds cross-dissolve
  - `OdometerCounter.tsx` — mechanical digit wheels roll to target number
- All 14 components (5 Phase 1 + 9 Phase 2) compile clean with zero TS errors
- Skill file `skills/cinematic-effects.md` updated with full API reference

**Still needed:**
- Review pilot story in Remotion Studio, tweak timing/sizing
- Add music bed (Touch It instrumental is in public/)
- Render final .mp4
- Post to IG Stories for April 14
- Phase 3 components (GradientStroke, SVGDraw, CircularText, CursorReveal, FlipCard, DynamicIsland) — build on demand

## Other open / pending items

- **MindBody live registration:** still BLOCKED waiting on Don to approve the **Ajeodesign** source for write access in MindBody Business → Manager Tools → Marketing → Apps & Integrations. Once approved, retest by submitting the form on the landing page — should create a client and enroll them in either enrollment ID **791** (Full/Block) or **792** (Weekly/Daily).
- Phase 1 social captions are written: `campaigns/summer-camp-2026/output/phase-1-week-1-2-captions.md`
- Optional next steps not started: print-ready CMYK PDFs, Phase 2 social, Upload-Post scheduling, carousel templates for posts 6 + 7

## Brand guardrails (don't forget)
- **Hook everywhere:** "Where Skills Turn to Confidence."
- **No daily lunch.** Pizza Fridays only. Water/Gatorade/fresh fruit daily.
- **No Coach Corey photos.**
- **Action shots only**, never coach-talking-to-kids portraits.
- **Pricing:** Full $3,015 / 4-Week $1,460 / Weekly $420 / Daily $110. (Killed the $84/day multi-day tier.)
- **5 hashtags max** on IG. FB captions ≤ 255 chars.
- Tag `@veteranwithacamera` whenever his footage is used.

## Key files reference

```
landing-page/
  index.html              ← main page (cinematic modules + form)
  api/register.js         ← MindBody serverless handler
  photos/                 ← 7 hero gallery shots (matched to flyer photos)
output/
  flyer-collage.html      ← FULL flyer 8.5×11 (current edit target)
  flyer-collage-half.html ← HALF flyer 5.5×8.5
  flyer-collage.png       ← Most recent render
  flyer-collage-half.png
  index.html              ← Gallery for client review
  hero-camp.jpg, hero-mitts.jpg, hero-drills-wide.jpg, hero-pushups.jpg
brand-context/summer-camp-2026.md  ← Single source of truth for camp facts
campaigns/summer-camp-2026/
  CAMPAIGN-PLAN.md
  BUILD-INSTRUCTIONS.md
  output/phase-1-week-1-2-captions.md
PASSDOWN.md               ← THIS FILE
```

## Vercel deploy commands

```bash
export PATH="/opt/homebrew/bin:$PATH:/Users/joestevens/Projects/node_modules/.bin"

# Landing page
cd landing-page && vercel --prod --yes --scope joemacstevens-projects

# Flyer gallery
cd output && vercel --prod --yes --scope joemacstevens-projects
```
