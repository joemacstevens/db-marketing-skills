---
workflow: general-video
flow: companion
storyboard: no
message: "The Sweet Science with Coach P: the fundamentals start with your feet"
destination: instagram-reels, facebook, threads, tiktok
aspect: 1080x1920
language: en
length: 20.8s
angle: footage-remix
---

## Intent

IMG_1868 (Wed 10/7 7:16 PM, 29.1s, 1280x720 HLG, rotation -90 so 720x1280 portrait), filmed and sent by Don
with the caption "The sweet science". It's Coach P's regular Sweet Science class (MindBody: The Sweet Science,
Wed 7-8 PM, Pablo Gary). A single-file line with a mini band around the ankles, stepping down the turf in
boxing stance, Coach P out front showing the stance at the end. There is also a Saturday Sweet Science class
with another coach, so no day or time goes on screen.

Joey 10/8 (v3): "turn it into music and have a voiceover over it, kind of explaining what's going on... explain
how our Sweet Science class helps with the fundamentals. We're not just hitting bags here. We work on footwork."

Versions: v1 `renders/sweet-science-v1.mp4` (room audio, no labels), v2 `renders/blue-collar-footwork-v2.mp4`
(wrongly labeled Blue Collar, superseded; snapshot in `build/build-v2.py` + `build/reel-v2.json`).
v3 `renders/sweet-science-v3.mp4` (DB anthem bed, snapshot `build/reel-v3.json`).
**v4 is current:** `renders/sweet-science-v4.mp4`, `previews/sweet-science-v4-phone.mp4`. Same as v3 except the music is
Coach P's own Because of Boxing song, the one playing in the room (Joey 10/8), and the cuts are re-snapped to its beat.

## Cut (v4, reel time, source time)

| Reel | Source | On screen |
|---|---|---|
| 0.00-1.50 | 18.00-19.50 | opener, no text: the whole line from the front |
| 1.50-6.88 | 7.00-12.38 | wide line from behind. Title 1.5-3.0, THE MOVE card 3.2-6.8, captions from 3.87 |
| 6.88-8.40 | 2.95-4.47 | whip in, punch-in on the band at the ankles, lands as the beat comes back |
| 8.40-10.90 | 12.50-15.00 | red-flash cut, alongside the middle of the line |
| 10.90-12.59 | 15.75-17.44 | whip in, band close from behind, then the line |
| 12.59-14.23 | 19.50-21.13 | red-flash cut, front of the line coming toward camera |
| 14.23-15.92 | 23.25-24.94 | front of the line close, stance, hands up |
| 15.92-17.62 | 27.30-29.01 | whip in, Coach P out front. Chip 16.20-17.62 |
| 17.62-20.82 | | end tag: logo, "what we do is absolutely different" lockup, @DBELITEFITNESS |

Cuts sit on the song's beat grid (aubio beat on because-of-boxing-main.mp3, about 144 BPM).

## On-screen text

- Title: small kicker "WITH COACH P", then THE SWEET / SCIENCE (red slab)
- THE MOVE: BANDED FOOTWORK, works line "Hips · glutes · balance" (3.2-6.8)
- VO captions, word-timed, active word on a red block (3.87-11.3): WE'RE NOT JUST HITTING BAGS IN HERE. / WE BUILD
  THE FUNDAMENTALS, / STARTING WITH YOUR FEET. / THE BAND KEEPS YOU IN YOUR STANCE, / SO EVERY PUNCH HAS A BASE UNDER IT.
  Nothing captioned under the title (it already says "the sweet science with Coach P").
- Coach chip: COACH P / Showing the stance (16.20-17.62), lower left, clear of his body
- End tag: logo, lockup, @DBELITEFITNESS
- The v1/v2 how-to line was dropped (the VO says it now).

Text stays above the heads (title, move card) or on torsos/turf (captions at y 1130, chip at y 1390). Checked on
render frames.

## Voiceover

One continuous ElevenLabs take, house voice `qVpGLzi5EhjW3WGVhOa9` (Berto, same as It's Just Work),
eleven_multilingual_v2, `scripts/generate-vo.mjs` settings plus `speed: 1.12` so it fits before the anthem's
pre-chorus (default speed ran 11.0s). File `assets/audio/vo-take4.mp3`, speech 0-9.34s, placed at reel 1.55, so
it ends at 10.89. Word times: Parakeet on the isolated take (`assets/transcripts/vo-take4.parakeet.json`),
whisper medium.en agrees word for word, and whisper on the final mix reads every line.

> This is the Sweet Science with Coach P. We're not just hitting bags in here, we build the fundamentals,
> starting with your feet. The band keeps you in your stance, so every punch has a base under it.

## Music (v4)

Coach P's "Because of Boxing", Pablo main version (`because-of-boxing/music/pablos/because-of-boxing-main.mp3`).
That's the song on the room speakers in IMG_1868. Onset cross-correlation of the room track gave song = src + 52.2
on all 9 four-second windows (z 4.7-7.8); the mens-song, pablos-men and pablos-women versions gave scattered
offsets. Stems: the existing ElevenLabs two-stem split `pablos/stems/main/` (25 ms behind the mix, same
performance), copied to `assets/audio/bob-stems/` (gitignored). No room audio in the mix.

- Reel 0 = song 34.72. The downbeat at song 52.34 = reel 17.62 = end tag.
- Instrumental stem under everything at 0.9, ducked to 0.25 (-12 dB) under the VO (1.55-10.91). It has no
  drop-outs in this range.
- Vocal stem muted under the VO (that keeps the "Elite Sports Academy" line and the chorus out). In at 11.2, after
  "transformation" ends, so the last shots carry "Full speed, full speed... you and me, we are not the same,
  we are not the same".
- End-tag hook: "I'm a different breed" (song 52.40) lands at reel 17.685, just after the cut to the end tag
  (17.62), as the logo stamps (17.67-18.07). "I got a different breed, forged from fire" follows under the tag.
  Verified by correlating the vocal stem against the final mix.
- No lyrics printed on screen.
- Master: render -15.4 LUFS, +1.4 dB plus alimiter (limit 0.89). Final -14.0 LUFS integrated, -1.0 dBFS peak.
- Listen check: whisper medium.en and small.en on the final mix read the full VO word for word over the bed, then
  the song lyrics after it.

v3 used the DB anthem stems the same way (reel 0 = song 31.3, "We are Different Breed" on the tag).

## Grade

"lite" correction (contrast 0.25, highlights -0.2, blacks -0.12, whites 0.02, vibrance 0.22, saturation 0) on a
zscale hable tonemap proxy. A2 turned the turf neon and skin orange in grade-compare.

## Files

- Edit `build/reel.json`, then `python3 build/build.py` and render. Master: `volume=+X dB,alimiter=limit=0.89`
  to -14 LUFS.
- Gitignored, rebuild from `don-drops/2026-10-08/raw/IMG_1868.mov`: `assets/footage/img1868.mp4` (zscale hable,
  `-g 15 -keyint_min 15`), `assets/audio/room-1868.m4a` (v1/v2 only).
- `assets/audio/db-stems/` (v3) and `assets/audio/bob-stems/` (v4) are gitignored. Rebuild bob-stems by copying
  `because-of-boxing/music/pablos/stems/main/{instrumental,vocals}.mp3` and `pablos/because-of-boxing-main.mp3`.

## Proposed caption

The sweet science starts with your feet, and Coach P keeps it fundamental every class #differentbreed #boxing #footwork #teaneck

## Flags

- Coach P ID by eye: profile at 720p (black beanie, black long sleeve, camo pants). Skin tone, short beard and
  lean build match him in Blue Collar Day 1 IMG_7830. He's the only adult out front facing the line.
- VO "Sweet Science" names the class. No day, time or other coach is mentioned.
- Faces are visible throughout (members in the line, Don filming). Nobody falls or breaks stance in the used
  ranges.
- The drill name is by eye: band at the ankles, boxing stance, stepping down the line. If Coach P calls it
  something else, change `move.name` in reel.json.
- The VO runs at speed 1.12. It reads clean in whisper, but give it a listen in case it feels rushed.
