# Visual Style Guide — Different Breed Elite Fitness

> **Bold magazine-cover energy meets real gym work.** Dark, cinematic, uppercase. No fluff, no filler, no corporate gloss. The gym speaks for itself.

This guide covers the full visual vocabulary across all DB output: reels, posts, landing pages, flyers, emails. Structured brand data lives in `brand-kit/brand.json` — that's the single machine-readable source for colors/fonts/voice id. This file is the human guide.

---

## Color Palette

### Core Colors
| Name | Hex | Usage |
|------|-----|-------|
| Black (base) | `#0E0E0E` | Backgrounds, primary |
| Charcoal (surface) | `#1C1C1C` | Cards, sections, lower-thirds, call-out bars |
| **Red (accent / DB Red)** | `#C4161C` | Actions, emphasis, key highlights, CTA, dividers |
| White | `#FFFFFF` | Text on dark, headlines, captions |
| Gray (muted) | `#8E8E8E` | Secondary text, labels, timestamps (never body on white) |

### Special Accents
| Name | Hex | Usage |
|------|-----|-------|
| Gold | `#C9A74A` | **RARE** — awards, championships, "Evolve into greatness" premium moments only. NOT general UI. |

### Color Rules
- **Red = emphasis only.** Use it like a highlighter, not a wash. CTAs, tags, underlines, the one thing that pops.
- Charcoal creates rhythm on black backgrounds (cards/sections).
- Gray for secondary text/labels only, never for body copy on white.
- Gold limited to "badge" moments (awards, credentials, championship callouts).

---

## Typography

### Fonts
- **Headlines (primary):** **Oswald** — Bold 700, **UPPERCASE**, tight tracking (-0.02em). Source: Google Fonts.
- **Body / captions:** **Inter** — 400/500/600, sentence case, 1.2 line-height. Source: Google Fonts.
- **Premium display (rare):** **Nord Minimal Display Headline** — for hero pieces and premium / brand-anchor moments only. Lives in `brand-kit/fonts/`.

### Type Rules
- Bold uppercase headline moments are on-brand.
- Avoid walls of all-caps paragraph text.
- Use caps for **headlines and labels** only; body in sentence case.
- Tight line lengths, strong hierarchy.
- **Never use:** rounded friendly fonts, script fonts, light weights for headlines.

---

## Logo System
- **DB circular mark** (red/black/white) — `brand-kit/logos/DB-logo@3x.png` (and SVG). Use for: favicon, social profiles, end-card center.
- **DB wordmark** (red+black, red+white) — `brand-kit/logos/DB-Word-logo-red+white@3x.png`. Use for: headers, page titles.
- **"Evolve Into Greatness" lockup** (black/white + red) — `brand-kit/logos/Evolve-into-greatness-DB-white-red@3x.png`. Use for: end-card / footer / premium moments.
- **"What we do is absolutely different"** lockups — section headers (sparingly).
- **"Strength. Individuality. Elite performance."** lockups — flexible callouts.

SVG variants live in `brand-kit/logos/svg/` for any vector use (web, print, large-format).

---

## Photography Style
- **Documentary, high-contrast, "real gym" energy.**
- Real sessions: coaches teaching, ring action, turf work, TRX/Pilates studio shots.
- Limit stock photos — the DB archive (`/Volumes/Ajeo/Projects/Different Breed/Media Library/`) is stronger.
- **Two acceptable treatments:**
  1. **True color** with controlled contrast (skin tones accurate)
  2. **B&W** for hero moments and coach portraits
- **Composition:**
  - Hero images: wide, negative space for headline
  - "Proof" images: close-up faces + emotion
  - Studio images: one establishing + one detail
- **Match photos to topic.** "Pilates for Men" means men on the reformers. Not TRX, not yoga. Mismatched footage has gotten posts pulled.

---

## Layout — Vertical Reels (1080×1920, 9:16)

- **IG safe zones:** leave top **220px** and bottom **330px** clear of critical text — IG UI overlays the captions/username and avatar.
- **Lower thirds / call-outs:** place at ~1200–1500px from top.
- **Logo / end card:** always in the last 2 seconds. Fade in, hold 1s, cut.

---

## Motion
- **Cuts:** fast. Nothing should sit longer than needed.
- **Transitions:** hard cuts 90% of the time. Occasional quick fade or beat-matched dip.
- **Captions:** pop-in per word, not fade-in. Matches the punchy vibe.
- **Intro:** optional 0.5s scale + bounce on a title card if the reel has a title.

---

## Editorial Voice

DB talks like a coach in the middle of a session. No bullshit, no hype-sell, no fake positivity.

### Do say
- "No shortcuts."
- "The work speaks for itself."
- "Evolve into greatness."
- "Different Breed."
- "This is the work."

### Don't say
- "Join our family!" (too soft)
- "Amazing journey" / "fitness journey" (corporate)
- "Transform your life" (infomercial)
- Anything that sounds like a Planet Fitness ad

### Caption structure (works every time)
```
[Hook — 1 line, bold claim or punchy statement]

[Body — 1-2 lines, what's happening, who's in it]

[CTA or tagline — 1 line]

[Tag the gym + coach + (if used) videographer]

[5 hashtags max]
```

### Example
```
Coach Dred's team putting in WORK 🥊

Sparring night at Different Breed — where the real lessons happen. No shortcuts.

Evolve Into Greatness.

@differentbreedsportsacademy @dredboxing @veteranwithacamera

#Boxing #SparringNight #DifferentBreed #EvolveIntoGreatness #NJBoxing
```

---

## Music & Audio

- **Always instrumental hip-hop.** No vocals → no copyright issues.
- Licensed tracks we've used before live in reel-project `music/` folders.
- Good sources: Free Music Archive, YouTube Audio Library (instrumentals), Artlist/Epidemic Sound (if license).
- **Beat-match cuts** when you can — gives free energy.
- **Ambient gym sound** (bag hits, timer, breathing) also works for raw/serious pieces.

### Voiceover
- Default voice: **ElevenLabs voice ID `qVpGLzi5EhjW3WGVhOa9`** (DB house voice).
- Style: confident, direct, coach-in-your-ear. Not narrator-y.
- **Duck music to 15%** while VO plays, fade back to 100% after.
- Scripts should be **tight** — 3 words per second of video is the max you want to hear.
- Generation script: `scripts/generate-vo.mjs`.

---

## On-Screen Captions

- **Always word-level timed.** Use Whisper (`whisper-captions.sh` in scripts/, `--model tiny --word_timestamps True`).
- **Style:** Oswald Bold 700, white, drop shadow, appears word-by-word.
- **Position:** lower third, above the IG UI safe zone.
- **Emphasis:** key words in DB Red `#C4161C`.

---

## End Card (always the same structure)

Last 2 seconds of every reel:

1. Dark background `#0E0E0E`
2. DB logo centered (`brand-kit/logos/DB-logo@3x.png` or word logo)
3. "EVOLVE INTO GREATNESS" tagline in Oswald below
4. Optional: coach IG handles or a single CTA ("Link in bio")
5. Hold for ~1s, then cut

Pre-built end-card PNG: `brand-kit/logos/Evolve-into-greatness-DB-white-red@3x.png`.

---

## Editorial Carousel Template (LOCKED)

Bold magazine-cover style for IG carousels:
- Dark background `#0E0E0E`
- Oswald uppercase headline text
- Red accent tags / underlines
- Photo fills top half
- "EVOLVE INTO GREATNESS" footer bar
- 1080×1080 at 2x scale for production

---

## UI Feel (landing pages, web, web emails)
- Bold, uppercase headline moments
- Strong dividers and accent lines
- Card surfaces in charcoal with red left border or red top rule (sparingly)
- **"Less but louder"** — fewer elements, higher contrast

---

## Topic-Specific Notes

### Kids Boxing
- Lean into **confidence / discipline / community** angle, not just punching.
- Class is Mon + Wed at 4 PM — surface that schedule if the reel is promotional.
- Coaches to tag: `@gfitbyglenda`, `@joebutta25`, `@sun_of_yah`.
- Parents are the audience as much as kids.

### Pilates (Core Control)
- Booking URL: `pilates.differentbreedsportsacademy.com`.
- Classes mostly CJ (`@cjbean122`); Wed morning is Nessa (`@ohsonessaa`).
- Sun 8 AM is **Women Only** — be specific in copy when promoting that slot.
- **Match photos to topic.** "Pilates for Men" means men on the reformers. Not TRX, not yoga.

### Adult Boxing / Sparring
- Coach Dred (`@dredboxing`) is the main face (pending canonical-roster confirmation — see `coaches-and-staff.md`).
- **Sparring nights** are the hero content. Use longer takes, intensity builds.
- Always quieter / more cinematic than the kids content.

### Highlights / Community Reels
- Mix segments: boxing + pilates + training. Variety of fighters.
- 45 seconds is the sweet spot.
- Best reference: the absorbed `WeeklyHighlights` composition under `reels/src/` (Phase C).

---

## Things we've learned (don't repeat)

1. **No symlinks** to SMB footage — FCP beach-balls on them. Copy real files.
2. **Don't post test captions to prod.** One accidental "test" post happened. Embarrassing.
3. **Match photos to topic.** A "Pilates for Men" post got pulled because it mixed women's classes + TRX B-roll.
4. **IG hashtags capped at 5.** Meta limit.
5. **FB captions capped at 255.** If you go over, post separately to IG and FB.
6. **Profile names are case-sensitive** in Upload-Post (`dbelitefitness`, not `DBElitefitness`).
7. **Upload-Post video goes async.** You MUST poll `getStatus(request_id)` to confirm delivery.
8. **Always credit the videographer** when his clips appear. Non-negotiable.
9. **Never publish without Joey's explicit approval.**
