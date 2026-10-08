---
workflow: general-video
flow: companion
storyboard: no
message: "Thursday morning treadmill sprints"
destination: instagram-story, facebook-story
aspect: 1080x1920
language: en
length: 18.1s
angle: footage-remix
---

## Intent

IMG_1878 (Don, Thu 10/8 9:39 AM, 22.5s, 1280x720 HLG, rotation -90 so 720x1280 portrait). Two women sprinting
side by side on the treadmills, one continuous shot. Story, lighter than a reel. Names unknown, nobody named.

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
