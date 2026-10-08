---
workflow: general-video
flow: companion
storyboard: no
message: "Morning Crew ep. 3: Don runs the clock on a dumbbell core + press set"
destination: instagram-reels
aspect: 1080x1920
language: en
length: 26.6s
angle: footage-remix
---

## Intent

Morning Crew episode 3 (ep1 9/24 rowing, ep2 10/1). Source is Don's IMG_1820 (Tue 10/6 7:07 AM, 43.7s, 720p30 HLG portrait). It shows the early class on the turf, a row of members on mats with dumbbells. Don runs three rounds on his clock. The room audio (Don counting plus the gym's music) is the spine and stays in natural sync the whole way. There's no bed under it. The "We are Different Breed" hook (song @48.8) plays only on the end tag.

## Moves (identified by eye)

1. DUMBBELL TOE TOUCH (src 0-5.4): on the back, legs straight up, one bell in both hands, crunch up and reach it to the toes. Works: upper abs · core.
2. DUMBBELL FLOOR PRESS (src 10-21.6): flat on the mat, knees bent, two bells pressed from the chest to lockout. Don calls it a press. Works: chest · shoulders · triceps.
3. DUMBBELL V-UPS (src 30.3-43.7): legs and bell come up together to meet over the hips. Don names them ("we're going for V-ups"). Works: abs · hip flexors.

## Cut (reel time, source time)

| Reel | Source | On screen / heard |
|---|---|---|
| 0.00-1.50 | 0.00-1.50 | Opener, no text. Camera passes close to the member in the white hoodie on a toe touch while the row works behind him. Don's count is heard. |
| 1.50-3.00 | 1.50-3.00 | Title over the row: IT'S JUST WORK / MORNING / CREW (45 frames). |
| 3.00-5.50 | 3.00-5.50 | Row of toe touches. Don: "...eight, nine, ten, we got time." THE MOVE 01/03 (3.05-5.38). |
| 5.50-12.10 | 8.50-15.10 | Floor press. Don: "Ready, and work time, work, one, two, three, four." THE MOVE 02/03 (7.10-11.95). The cut has a blur dip and a red edge flash. |
| 12.10-23.36 | 32.40-43.66 | V-ups, one unbroken count. Don: "one ... five, (feet) to the ground, six, don't let your feet touch the ..., seven, eight, nine, and time." THE MOVE 03/03 (12.45-16.70). Ends close on the white-hoodie member at the top of a rep, then whips to the end tag. |
| 23.36-26.56 | — | End tag: DB logo, "What we do is absolutely different" lockup, @DBELITEFITNESS. Song hook from 23.21. |

## On-screen text (all of it)

- IT'S JUST WORK / MORNING / CREW
- THE MOVE · 01/03 / DUMBBELL / TOE TOUCH / UPPER ABS · CORE
- THE MOVE · 02/03 / DUMBBELL / FLOOR PRESS / CHEST · SHOULDERS · TRICEPS
- THE MOVE · 03/03 / DUMBBELL / V-UPS / ABS · HIP FLEXORS
- End tag: lockup + @DBELITEFITNESS

None of Don's speech is burned in.

## Proposed caption

Tuesday 7 AM crew putting in work like they always do

#differentbreed #morningworkout #corework #teaneck

## Notes

- Grade: skin-safe correction (contrast 0.2, highlights -0.24, blacks -0.12, vibrance 0.12, saturation -0.04, temp -0.02) in `build/grade.txt`. I ran A2 and lite through grade-compare on 3 frames, and both turned the turf neon and the skin orange.
- Audio: `assets/audio/room-1820.m4a` is the source audio with a gentle compressor (thr -30 dB, 3:1, +6 dB makeup) to even out Don near/far. The V-up segment gets +3 dB (lane gain 1.41) and the hook sits at 0.57. Note that the renderer ignores `data-volume` once a volume lane exists, so the gains are set in the lanes. Master: plain gain to -14 LUFS plus alimiter. Final measures -14.1 LUFS, -1.2 dBFS peak.
- Words: whisper small.en + medium.en on 8 isolated windows, plus Parakeet on the full clip. "Ready, and work time, work, one" agreed everywhere. The V-up coaching line ends differently in every pass ("ceiling" / "sevens" / "tennis" / "descend"), and "feet up/off the ground" is also unclear, so neither is captioned.
- Proxies (gitignored): `assets/footage/img1820.mp4` = zscale hable tonemap of `don-drops/2026-10-08/raw/IMG_1820.mov`, `-g 15`. `assets/audio/don-1820.m4a` is the raw audio, and `room-1820.m4a` is the compressed version.
- Edit with `python3 build/build.py`, then `npx hyperframes@0.8.98 render -o renders/morning-crew-raw-v1.mp4`, then master (gain to -14 + alimiter limit=0.84) to `renders/morning-crew-v1.mp4`.

## Flags

- Room music runs under the whole count (whisper tags it as music). It's unidentified, so IG/FB could mute or claim it. If they mute it, Don's count goes too.
- Faces: the member in the white hoodie is close up at the opener and the V-up finish. Members in a blue cap and an orange cap are close at the start of the V-ups. All are unnamed and nobody is tagged. Don (red tee) is in the background of the toe-touch and V-up shots.
- Floor press was also a move in ep2 (different footage). Cutting it would drop the "work time" call, so I kept it.
- The move labels are on-footage overlays in the HyperFrames TRX style, not full-screen red interstitials like the ep2 Remotion cut. That's because the count audio never breaks.
- Winning moments: nobody drops a bell or quits a rep. In the wide V-up shots a couple of members lie flat between reps, which is normal pacing.
