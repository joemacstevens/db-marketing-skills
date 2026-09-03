# Don't Fall Off Fitness Special — Higgsfield Production Script

> **POSTED 2026-09-01: v17.** IG https://www.instagram.com/reel/DcwiXOlDLRS/ · FB https://www.facebook.com/reel/1583291009836185 · calendar id `2026-09-01-dont-fall-off-special-v17` · captions in `captions-as-posted.md`. Joey's final call: the v18/v19 deterministic spot paint-overs looked worse than the shine itself; v17 (Seedance-softened, artifact-free) shipped. Don had pre-cleared imperfect spot removal ("if not it's understandable").

**What this is:** the shooting script for the Higgsfield build of the Don't Fall Off promo.
**Campaign home:** `campaigns/dont-fall-off-special/` in the `next-bob-stories-7662ea` worktree (untracked there). BRAINSTORM.md, STATUS.md, sketches, and the v12 render all live in that folder. v12 (Veo/Seedance-via-Krea build) went to Don for review 9/1. This script is the Higgsfield version: same approved structure and lines, upgraded middle.
**Target runtime:** ~30s · 9:16 · 30fps.

---

## Locked creative (do not relitigate, 12 versions of feedback behind this)

- Character: anime Don. 90s boxing-manga style (style B), halftone screentone, set in the REAL DB ring (DIFFERENT BREED rope wraps, blue corner pads, mat logo, "It's Just Work" wall). Illustrated only, never photoreal Don.
- Warmth lives in the BROWS. Relaxed brows, soft crinkled eyes, real smile. "Never furrows his brow, never glares" goes in every prompt verbatim. A smile over furrowed brows reads as a devil. Eye-check every grin frame.
- Voice continuity: separate generations re-roll the voice. ALL coach dialogue comes from ONE generation, split in edit. The announcer in the middle is a deliberately different voice (Gemini TTS, Charon).
- Stilted is the enemy: full-body performance direction in the prompt (steps, arms, lean-in, nod). v7 scored 2/10 liveliness as a talking head.
- Numbers live on Remotion cards, never spoken in full, never AI-rendered. Composite the real DB logo, never let the model draw it.
- Winning moments only in the b-roll. Nothing missed, nothing dropped.
- End tag house style: no logo. "DON'T FALL OFF." / "BE DIFFERENT." stamps, ASK AT THE FRONT DESK ribbon, red @dbelitefitness.

---

## The spoken script

**COACH** = anime Don, deep gravelly warm voice, a smile you can hear. Native audio from the master generation.
**ANNOUNCER** = hype but clean, intentionally different voice from the coach (Gemini TTS Charon, one continuous read, sliced).

> **COACH (open):**
> "Hey. You. Don't let your fitness gains fall off. You've worked too hard."
>
> **ANNOUNCER:**
> "The Don't Fall Off Fitness Special, at Different Breed.
> Three packages. Desire. Discipline. Dedication.
> Desire. Fifteen sessions, plus eight on us.
> Discipline. Twenty sessions, plus ten on us, and two body scans.
> Dedication. The big one. Forty eight sessions, eleven on us.
> Two to three sessions a week, minimum. That's the deal."
>
> **COACH (close):**
> "Consistency is the true measure of greatness. Be great."

Every coach word is Don's, near verbatim from the Aug 31 meeting. The announcer carries the CTA and the blanket close per the structure already in front of Don. If Don's v12 notes ask for the coach to speak the CTA himself, add it as a third line group in the master generation, same take.

Held in reserve (Don's text, unused so far): "Don't let the holidays slow you down. Don't fall off." Caption line or mid-campaign variant, not this cut.

---

## Beat map (~30.5s)

| Time | Shot | Visual | Audio |
|---|---|---|---|
| 0.0–5.0 | 1 | Coach master, first half: he takes a step in, friendly point at the lens | COACH open |
| 5.0–7.5 | 2 | Ring wide (`b2-ring-wide.png`) push-in, title stamps: THE DON'T FALL OFF FITNESS SPECIAL, red rule | ANNOUNCER CTA, bed enters |
| 7.5–9.5 | 3 | Three D's index: DESIRE / DISCIPLINE / DEDICATION stack in one at a time | "Three packages…" |
| 9.5–13.5 | 4 | DESIRE card over b-roll 1: heavy bag combination (boxing gym) | "Desire. Fifteen sessions…" |
| 13.5–17.5 | 5 | DISCIPLINE card over b-roll 2: sled pull on the turf (Pulse) | "Discipline. Twenty sessions…" |
| 17.5–21.5 | 6 | DEDICATION card over b-roll 3: Jacob's ladder climb (Pulse) | "Dedication. The big one…" |

Cards sit on a dark gradient overlay (roughly 55 to 65 percent black, heavier behind the text block) so the numbers stay readable over the moving b-roll. The overlay lives in the Remotion comp, not in the generations, so the raw clips stay reusable. Spreading the three stations across the boxing gym and Pulse also sells the facility, not just boxing.
| 21.5–24.0 | 7 | Minimum chip over b-roll 4: woman barbell squat (Pulse), same overlay | "Two to three sessions a week…" |
| 24.0–28.5 | 8 | Coach master, second half: creed, big warm grin, one nod | COACH close |
| 28.5–30.5 | 9 | Freeze on the grin, end stamps: DON'T FALL OFF. / BE DIFFERENT. / ASK AT THE FRONT DESK / @dbelitefitness | bed out |

Trim levers if it must hit 30 flat: tighten shots 2+3 by 0.5s each, or shave the freeze.

---

## Package cards (Remotion, numbers verbatim, math verified against Don's 8/31 text)

| Card | Lines on card | Chip |
|---|---|---|
| DESIRE | 15 SESSIONS · $1,290 · +8 COMP SESSIONS · 1 BODY SCAN · SAVE $688 | 2X A WEEK MIN |
| DISCIPLINE | 20 SESSIONS · $1,520 · $76 A SESSION (REG. $82) · +10 COMP SESSIONS · 2 BODY SCANS · SAVE $940 | 2X A WEEK MIN |
| DEDICATION | 48 SESSIONS · $3,408 · $71 A SESSION (REG. $78) · +11 COMP SESSIONS · 2 BODY SCANS · SAVE $1,194 | 3X A WEEK MIN |

---

## Higgsfield generations

Setup first: `higgsfield workspace set` (calls exit 4 without it), then validate params once with `higgsfield model get seedance_2_0 --json`.

### Gen A — coach master (the only generation with dialogue)

One take, both line groups, split at his pause in the edit. One gen = one voice.

```bash
higgsfield generate create seedance_2_0 \
  --start-image "<campaign>/sketches/friendly-base-1.png" \
  --duration 12 --resolution 1080p --aspect_ratio 9:16 --wait
```

Prompt:

> Animate this 1990s boxing-manga illustration, preserving its exact ink linework, halftone screentone texture, colors and character design throughout. Limited-animation anime style in a real boxing gym ring. The camera is locked, no push-in, no cuts. CRITICAL: the coach's face stays warm and friendly for the ENTIRE video. Eyebrows relaxed, eyes soft and kind, a genuine welcoming smile between and during lines. He NEVER glares, NEVER furrows his brow, NEVER snarls, zero menace. He is a beloved older coach welcoming you in, playful and encouraging, like he is teasing a friend he believes in. Full-body performance: he takes one easy step toward camera, gives a friendly point at the lens, opens his arms wide, leans in with a laugh. In a deep gravelly warm voice with a smile you can hear, upbeat and rhythmic: "Hey. You. Don't let your fitness gains fall off. You've worked too hard." Then a short happy beat, hands settle, then warm and proud, like handing you the secret he lives by: "Consistency is the true measure of greatness. Be great." He finishes with a big warm smile, one approving nod, and a thumbs up. Mouth animates naturally only while he speaks. Quiet gym room tone under his voice, no music.

Fallback if Seedance 2.0 fights the style: `seedance_2_5` omni_reference (the exact pipeline that produced the approved v9 bookend, 720p cap noted).

### Gen B — anime training b-roll (silent, under the cards)

**GENERATED 9/1** → keepers are `higgsfield-raw/broll-bag.mp4`, `broll-sled.mp4`, `broll-ladder-v2.mp4`, `broll-squat.mp4` (1080x1920, 5s each, 45 credits per clip). `broll-ladder.mp4` (v1) is the jungle-gym miss, kept only as a reference for the prompt lesson below. Full middle coverage: bag → Desire, sled → Discipline, ladder → Dedication, squat → three-names index.

**v14 CUT 9/1** (Joey: signal the savings early) → `reels/out/dont-fall-off-v14.mp4`. One change from v13: red skewed chip top-left, "SAVE UP TO $1,194", slams in at frame 20 and lives only through the coach open (specific number per writing rules, not vague "savings inside").

**v19 CUT 9/1 — v18 flickered in motion** (Joey: "weird flashing on the head"): stateless per-frame detection made the patch jitter and blink on dropout frames. Fix: detect ALL frames first, interpolate gaps so the patch never vanishes, gaussian-smooth position/radius/base-color trajectories over time, THEN apply. Verified with the pop check (min patch area 9,982px, never absent), flicker metric (patched region -2.47 vs original, calms not agitates), and worst-jump frame pairs eyeballed identical. Assets: `bookend-seedance-matte2.mp4` + `endhold-matte2.png`. Master `reels/out/dont-fall-off-v19.mp4`. QC laws, final form: stills need a contact sheet, MOTION needs the pop check + flicker metric (`tools/patch-pop-check.py`, `tools/patch-flicker-metric.py`).

**v18 CUT 9/1 — the spot removal that actually worked.** Joey caught v17 (shine still there — my QC had sampled one lucky frame; Seedance video_edit under-applied, and a second pass with a clean target still under-applied: style priors keep repainting comic-bald-head shine). The kill was deterministic: per-frame detection of the two brightest skin blobs in the crown zone (stateless, no tracking drift — template tracking drifted 400px by the close) + frequency-separation deglow (blur isolates the smooth glow, blend those pixels toward the ring-median skin COLOR, per-pixel skin-gating so background never stains, plus a gentle core flatten so no rim survives). Tools preserved: `tools/deglow-scalp-spots.py` + `tools/head-contact-sheet.py` (12-frame QC sheet — use it on EVERY visual fix; single-frame QC is how v17 shipped wrong). New assets: `bookend-seedance-matte.mp4` (original audio muxed), `endhold-matte.png`. Master `reels/out/dont-fall-off-v18.mp4`.

**v17 CUT 9/1 — Don's nit: the two scalp highlight spots.** Fixed via the v8-proven recipe: Seedance 2.5 `video_edit` on the bookend (1080p available despite the skill doc's 720p note; res + duration preserved 1074x1928/12.04s) with a change-nothing-else prompt → original audio muxed back (`bookend-seedance-clean.mp4`) → endhold re-extracted at 11.87s (`endhold-clean.png`). Don also said "Excellent" to v16's one-voice fix ("Alright, same voice throughout" was Joey's caption). v17 = b-roll middle + one coach voice + clean scalp. Master `reels/out/dont-fall-off-v17.mp4`. Note: bag/sled b-roll still have head shine under the dark overlay; edit the same way only if Don asks.

**v16 CUT 9/1 — the fix that stuck.** Joey's ear on v15: still two voices. Root cause: STS keeps the SOURCE's delivery (announcer prosody) and only swaps timbre — identity lives in prosody. v16: the four middle lines generated as FRESH TTS from the cloned coach voice (eleven_multilingual_v2, stability 0.4 / similarity 0.9 / style 0.25, previous_text/next_text chained for flow; `<break>` tags to pace the three names). Lines pinned at 0.27 / 3.46 / 8.62 / 14.38s → `announcer-coach-tts.m4a` (18.96s, +1.3dB match), index-card name pops retimed to onsets 5.19 / 6.47 / 7.84s. Master `reels/out/dont-fall-off-v16.mp4`, full-mix whisper verbatim (TTS even enunciates "comp sessions" cleaner than the STS did). Lesson for all future voice matching: STS = same performance different throat; TTS-from-clone = same PERSON — use TTS-from-clone when the goal is one consistent character voice.

**v15 CUT 9/1 — Don's ask: ONE VOICE throughout.** Route that worked: ElevenLabs instant clone from the bookend's own 10s of speech (`voice/coach-sample.wav`; voice_id in `voice/coach-voice-id.txt`, named "DB Anime Coach (Dont Fall Off)" in the account — REUSE it for any future coach VO) → **speech-to-speech** over the existing `announcer-fun` read → word timings identical, zero comp re-timing, level matched at -3.5dB → `reels/public/dont-fall-off/announcer-coach.m4a`. Needed Joey to add `voices_write` + Speech to Speech scopes to the ElevenLabs key. Routes that FAILED: Seed Audio with an audio reference (re-speaks the reference's own lines, ignores new text) and Seedance 2.5 omni_reference with the bookend video (returns the reference performance itself — both "new" takes came back as the bookend). Master `reels/out/dont-fall-off-v15.mp4`, full-mix whisper QC verbatim. With Joey for ear check ("comp sessions" ~0:14), then Don.

**v14 SENT TO DON 9/1 by Joey himself** — he attached the 10MB review proxy (`dont-fall-off-v14-review.mp4`) directly in iMessage. v14 supersedes the v13 Drive link as the version Don is judging. ⚠️ On his yes, publish the full-quality MASTER (`dont-fall-off-v14.mp4`, 32.4MB), never the crf-26 proxy, and flip the calendar entry from v12 → v14.

**v13 SENT TO DON 9/1** (Joey's go): two texts to +12016653665, short note + bare `/file/d/<id>/view` link (the rich-card trick). Drive: `DB Reels Review 2026-08-31/dont-fall-off-v13.mp4`, link https://drive.google.com/file/d/13ZC6kzJQJjaHdoywQ_rWQ5B5GTVSfxas/view?usp=sharing — told Don this replaces the morning (v12) link. Awaiting his word → flip calendar entry from v12 → publish.

**v13 CUT 9/1** → `reels/out/dont-fall-off-v13.mp4` in THIS worktree (31.25s, 32.5MB). The full reels project was cloned here from the next-bob-stories worktree (APFS `cp -c`, so the sync was instant); comp change = new `BrollBG` (muted OffthreadVideo + 55–74% dark gradient + red glow + scanlines) wrapping the index card and all three package cards. Bookends, captions, announcer, bed, and timings untouched from v12. QC'd frame-by-frame: cards readable, numbers digit-perfect, bookends intact. QC'd: style matches the coach frames, all winning moments, no readable AI text except faint rope-wrap mush on the bag clip (buried by the card overlay). Casting note: Seedance carried Don in from the style ref on bag + sled; the ladder clip cast a generic member. Re-roll lever if more variety is wanted: describe a different member explicitly in the prompt.

Three separate 5s gens, one station each, style-matched by reference to the approved manga frames. Separate gens cut cleaner in Remotion and each can be re-rolled independently. No dialogue, no on-screen text in any of them. Members are generic anime adults, never a recognizable real member.

```bash
higgsfield generate create seedance_2_0 \
  --image "<campaign>/sketches/b2-ring-wide.png" \
  --prompt "<station prompt>" \
  --duration 5 --resolution 1080p --aspect_ratio 9:16 --wait
```

**B-roll 1, heavy bag (boxing gym):**

> 1990s boxing-manga anime, same ink linework, halftone screentone texture and color palette as the reference image, inside the same boxing gym. A powerful boxer rips a crisp four punch combination into a heavy bag. Every punch lands clean and heavy, the bag jumps, chains rattle, halftone speed lines and a manga impact frame on the final hook, sweat streaks flying. Confident and landed, nothing missed. Dynamic anime camera with a slight push in, vertical 9:16 framing, no text anywhere, no dialogue, gym ambience only.

**B-roll 2, sled pull (Pulse performance floor):**

> 1990s boxing-manga anime, same ink linework, halftone screentone texture and color palette as the reference image, set on the turf strip of a performance training gym. A strong athlete drives a weighted sled forward in a low explosive push, plates stacked, legs firing like pistons, turf chewing under their shoes, halftone speed lines trailing the sled, gritted determined face, powerful and unstoppable. Dynamic low anime camera tracking alongside, vertical 9:16 framing, no text anywhere, no dialogue, gym ambience only.

**B-roll 3, Jacob's ladder (Pulse performance floor):**

v1 whiffed: "Jacob's ladder machine" alone got a guy sprinting under monkey bars (the model does not know the equipment, and the head-on camera hid the incline). Lesson: describe specialty machines mechanically and shoot them side profile. v2 prompt:

**B-roll 4, woman barbell squat (Pulse, added 9/1 per Joey):** AS BUILT in v13 the squat runs under the THREE-NAMES INDEX card, because the v12 comp has no separate minimum-chip beat (the rules line plays over the Dedication card). Human mix runs coach / coach / man / woman. Alt placement if only one Don clip is wanted: squat takes the Discipline card and the sled becomes a spare. Prompt describes the athlete explicitly (a strong athletic Black woman, ponytail, black tank and leggings) repping a loaded back squat in a rack, three-quarter side profile, driving UP powerfully, rep completed clean, slight low camera.

> 1990s boxing-manga anime, same ink linework, halftone screentone texture and color palette as the reference image, set in a performance training gym. A Jacob's Ladder climbing machine shown in side profile: a ladder treadmill angled at 40 degrees, one continuous loop of horizontal wooden rungs that rotates downward as the athlete climbs, like a treadmill belt made of ladder rungs, held in a black steel frame. There are no overhead bars and nothing above the athlete, this is not monkey bars and not a jungle gym. A young athletic Black man in a black tee climbs the incline on all fours, hands gripping rung after rung, feet driving off the rungs below, body leaned forward along the 40 degree slope, climbing hard while the rungs cycle down beneath him, sweat flying, halftone speed lines. Strong and relentless, side profile anime camera with a slow push in, vertical 9:16 framing, no text anywhere, no dialogue, gym ambience only.

### Audio

- Announcer: `scripts/generate-tts-gemini.mjs`, voice Charon, the full announcer block as ONE read, sliced per beat (proven pipeline).
- Bed: reuse the approved v12 boom-bap bed (`reels/public/dont-fall-off/`), starts frame 1, ducked under all speech.

### Assembly

Remotion, comp `DontFallOffSpecial` in `reels/src/DontFallOffSpecial.tsx` (lives in the next-bob-stories worktree, untracked). Swap clip sources, re-time captions to the new whisper timings, re-check every `startFrom` after the swap (the v10 close-beat bug was a stale startFrom).

---

## QC gate before it goes anywhere

1. Whisper small.en on Gen A: dialogue verbatim, "gains" not "games".
2. Eye-check every grin frame at full res. Brows relaxed the whole way.
3. Real DB circle logo composited over any AI emblem. No AI micro-text survives.
4. Card numbers against Don's 8/31 text, digit by digit.
5. Optional: `higgsfield generate create brain_activity --video <final>.mp4 --wait` for a hook/retention score before Don sees it.
6. Don reviews, then Joey's go, then publish. First comment (fine print) set at publish time, never after. Captions already drafted in `captions.md` in the campaign folder.
