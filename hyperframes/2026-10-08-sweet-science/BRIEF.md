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
**v3 is current:** `renders/sweet-science-v3.mp4`, `previews/sweet-science-v3-phone.mp4`.

## Cut (v3, reel time, source time)

| Reel | Source | On screen |
|---|---|---|
| 0.00-1.50 | 18.00-19.50 | opener, no text: the whole line from the front |
| 1.50-6.87 | 7.00-12.37 | wide line from behind. Title 1.5-3.0, THE MOVE card 3.2-6.8, captions from 3.87 |
| 6.87-8.55 | 2.95-4.63 | whip in, punch-in on the band at the ankles, lands as the beat comes back |
| 8.55-10.94 | 12.50-14.90 | red-flash cut, alongside the middle of the line |
| 10.94-12.63 | 15.75-17.43 | whip in, band close from behind, then the line |
| 12.63-14.18 | 19.50-21.05 | red-flash cut, front of the line coming toward camera |
| 14.18-15.86 | 23.25-24.93 | front of the line close, stance, hands up |
| 15.86-17.62 | 27.30-29.06 | whip in, Coach P out front. Chip 16.15-17.62 |
| 17.62-20.82 | | end tag: logo, "what we do is absolutely different" lockup, @DBELITEFITNESS |

Cuts sit on the anthem's beat grid (aubio beat on different-breed-song.mp3).

## On-screen text

- Title: small kicker "WITH COACH P", then THE SWEET / SCIENCE (red slab)
- THE MOVE: BANDED FOOTWORK, works line "Hips · glutes · balance" (3.2-6.8)
- VO captions, word-timed, active word on a red block (3.87-11.3): WE'RE NOT JUST HITTING BAGS IN HERE. / WE BUILD
  THE FUNDAMENTALS, / STARTING WITH YOUR FEET. / THE BAND KEEPS YOU IN YOUR STANCE, / SO EVERY PUNCH HAS A BASE UNDER IT.
  Nothing captioned under the title (it already says "the sweet science with Coach P").
- Coach chip: COACH P / Showing the stance (16.15-17.62), lower left, clear of his body
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

## Music

No room audio (the room song was unidentified, possible mute risk). Bed = the DB anthem itself, split into
instrumental + vocal stems with `scripts/separate-music-stems.mjs` (`assets/audio/db-stems/`). Reel 0 = song 31.3.

- Instrumental stem under everything at 0.9, ducked to 0.25 (-12 dB) under the VO (1.55-10.91). The song's own
  stop-time (song 37.0-38.1, reel 5.7-6.8) leaves "we build the fundamentals" in the clear, and the beat comes
  back on the band close-up cut.
- Vocal stem muted under the VO, then in from 10.91, so the anthem's pre-chorus plays over the last shots:
  "Hands up, chin down, here we go" (reel 11.2) and "Feel the whole room start to grow" (14.8). No lyrics are
  printed on screen.
- "We are Different Breed" (song 48.96) lands at reel 17.66, as the end-tag logo stamps. It's the same song
  running straight through, so there's no crossfade at the end tag.
- Master: render -15.1 LUFS, +1.1 dB plus alimiter (limit 0.89). Final -14.0 LUFS integrated, -1.0 dBFS peak.

## Grade

"lite" correction (contrast 0.25, highlights -0.2, blacks -0.12, whites 0.02, vibrance 0.22, saturation 0) on a
zscale hable tonemap proxy. A2 turned the turf neon and skin orange in grade-compare.

## Files

- Edit `build/reel.json`, then `python3 build/build.py` and render. Master: `volume=+X dB,alimiter=limit=0.89`
  to -14 LUFS.
- Gitignored, rebuild from `don-drops/2026-10-08/raw/IMG_1868.mov`: `assets/footage/img1868.mp4` (zscale hable,
  `-g 15 -keyint_min 15`), `assets/audio/room-1868.m4a` (v1/v2 only).
- `assets/audio/db-stems/*.mp3` (~7 MB) are not gitignored.

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
