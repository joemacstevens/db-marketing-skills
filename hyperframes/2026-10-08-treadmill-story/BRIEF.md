---
workflow: general-video
flow: companion
storyboard: no
message: "Thursday morning treadmill sprints, with a coach VO"
destination: instagram-story, facebook-story
aspect: 1080x1920
language: en
length: 18.1s
angle: footage-remix
---

## Intent

IMG_1878 (Don, Thu 10/8 9:39 AM, 22.5s, 1280x720 HLG, rotation -90 so 720x1280 portrait). Two women sprinting
side by side on the treadmills, one continuous shot. Story, lighter than a reel. Names unknown, nobody named.

## v2 (current): VO

Joey 10/8: "I love that treadmill one, but it needs some kind of voiceover, something motivational about the ladies
running. Short, play with the music." v2 = `renders/treadmill-story-v2.mp4`, `previews/treadmill-story-v2-540.mp4`.
v1 (no VO) snapshot in `build/reel-v1.json` + `build/build-v1.py`, render `renders/treadmill-story-v1.mp4`.

> Look at these two. Thursday morning and they're giving that treadmill everything they've got. That's the standard in here.

- One ElevenLabs take, house voice `qVpGLzi5EhjW3WGVhOa9` (Berto), eleven_multilingual_v2, generate-vo.mjs settings,
  default speed: `assets/audio/vo-take1.mp3` (6.59s file, speech 0.08-6.24). `vo-take2.mp3` is an unused alternate.
- The same take is placed twice: lines 1-2 straight through at story 1.70 ("Look" 1.78, "two." ends 2.56,
  "Thursday" 3.04, "got." ends 6.27), then line 3 from take 4.94 at story 14.50 ("That's" 14.58 on the beat,
  "here." ends 15.80), so it lands right before the "We are Different Breed" end beat at 16.10.
- Word times: Parakeet on the isolated take (`assets/transcripts/vo-take1.parakeet.json`), phrase starts from
  silencedetect. whisper medium.en and small.en on the final mix read every word.
- Bed: instrumental ducked to 0.3 under each line, vocal stem out while the VO talks, both back up between lines
  (6.5-14.4 is music only, with the "we are different" chorus chant under the stride punch-in).
- End-beat dip fixed: two beats of the chorus instrumental (stem from song 116.12, 0.6) under the a cappella hook,
  16.10-16.96, until the anthem's own beat returns at 16.95. The hook section is now about -11 to -14 dB short-term
  (v1: about -20).
- Captions: word-timed, sweet-science style, centered at y 1400 (under the move card, inside the safe zone).
- Master: render -13.8 LUFS, -0.1 dB plus alimiter. Final -14.0 LUFS, -1.6 dBFS peak.

## Cut (story time, source time)

| Story | Source | On screen |
|---|---|---|
| 0.00-6.89 | 5.60-12.49 | wide, both women. Move card 1.74-6.62 |
| 6.89-10.29 | 12.49-15.89 | red-flash punch-in to a medium on both profiles, arms driving |
| 10.29-16.10 | 15.89-21.69 | back to the frame, camera in closer |
| 16.10-18.10 | | whip to the end beat: logo, "what we do is absolutely different" lockup |

Source runs straight through, no moment repeated. Cuts on the anthem beat grid (aubio, ~143 BPM).

## On-screen text

Move card, lower band (y 1000-1340, on the treadmill arm, clear of faces, feet and story UI):
kicker THURSDAY MORNING, name TREADMILL / SPRINTS, works line LEGS · LUNGS · CONDITIONING.

## Audio

No room audio (gym speakers only, unidentified track). DB anthem `assets/audio/different-breed-song.mp3`:
- Footage: ElevenLabs stems in `assets/audio/db-stems/` (gitignored), story 0 = song 102.41, through song 118.51
  (the beat before the anthem's own instrumental drop-out at 118.6). Instrumental 1.0, vocal stem 0.4, so the
  "we are different" chorus chant sits under the beat.
- End beat: full mix from song 48.85, so "We are Different Breed" (48.96) lands on the logo stamp (16.21) and the
  beat slams back in at 49.70 (story 16.95) as the lockup rises. Fades out over the last 0.5s.
- Master: render -12.2 LUFS, -1.8 dB plus alimiter (0.89). Final -14.0 LUFS, -4.1 dBFS peak.

## Grade

"lite" correction (same as 2026-10-08-sweet-science) on a zscale hable tonemap proxy.

## Files

Edit `build/reel.json`, `python3 build/build.py`, render with `--sdr`, then master with
`volume=-1.8dB,alimiter=limit=0.89`. Proxy (gitignored) rebuilds from `don-drops/2026-10-08/raw/IMG_1878.mov`
with the zscale hable chain and `-g 15 -keyint_min 15`.
