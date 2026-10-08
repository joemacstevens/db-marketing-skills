---
workflow: general-video
flow: companion
storyboard: no
message: "Blue Collar 2026 Day One finisher: Coach P counts the dumbbell core + press set on the mats"
destination: instagram-reels
aspect: 1080x1920
language: en
length: 26.6s
angle: footage-remix
---

## Intent

The source is IMG_1820 (Tue 10/6 7:07 AM, 43.7s, 720p30 HLG portrait). It's the finisher of Blue Collar fight camp Day 1, shot about five minutes after the 6:02-7:02 AM clips in `Blue Collar 2026/Day 1/`. Joey confirmed this on 10/8. The coach on the clock is Coach P (Pablo: red DB tee, white beanie, blue shorts), walking the line. v1 was mislabeled "Morning Crew ep. 3" with the voice credited to Don. v2 fixes the title and the credit. The cut, move cards, count audio and end tag are unchanged from v1.

The room audio (Coach P counting plus the gym's music) is the spine, in natural sync the whole way, with no bed under it. The "We are Different Breed" hook (song @48.8) plays only on the end tag.

## Moves (identified by eye)

1. DUMBBELL TOE TOUCH (src 0-5.4): on the back, legs straight up, one bell in both hands, crunch up and reach it to the toes. Works: upper abs · core.
2. DUMBBELL FLOOR PRESS (src 10-21.6): flat on the mat, knees bent, two bells pressed from the chest to lockout. Coach P calls it a press. Works: chest · shoulders · triceps.
3. DUMBBELL V-UPS (src 30.3-43.7): legs and bell come up together to meet over the hips. Coach P names them ("we're going for V-ups"). Works: abs · hip flexors.

## Cut (reel time, source time)

| Reel | Source | On screen / heard |
|---|---|---|
| 0.00-1.50 | 0.00-1.50 | Opener, no text. Camera passes close to a member in a white hoodie on a toe touch while the row works behind him. Coach P's count is heard. |
| 1.50-3.00 | 1.50-3.00 | Title in the band above the row (y 370-670, clear of the members' faces): BLUE COLLAR 2026 / DAY ONE / FINISHER (45 frames). Coach P stands behind it with his face just above the kicker. |
| 3.00-5.50 | 3.00-5.50 | Row of toe touches. Coach P: "...eight, nine, ten, we got time." THE MOVE 01/03 (3.05-5.38). |
| 5.50-12.10 | 8.50-15.10 | Floor press. Coach P: "Ready, and work time, work, one, two, three, four." THE MOVE 02/03 (7.10-11.95). The cut has a blur dip and a red edge flash. |
| 12.10-23.36 | 32.40-43.66 | V-ups, one unbroken count. Coach P: "one ... five, (feet) to the ground, six, don't let your feet touch the ..., seven, eight, nine, and time." THE MOVE 03/03 (12.45-16.70). The COACH P chip shows 17.0-20.4 while he's on screen top-left and his count is the main sound. Ends close on the white-hoodie member at the top of a rep, then whips to the end tag. |
| 23.36-26.56 | — | End tag: DB logo, "What we do is absolutely different" lockup, @DBELITEFITNESS. Song hook from 23.21. |

## On-screen text (all of it)

- BLUE COLLAR 2026 / DAY ONE / FINISHER ("DAY ONE" is spelled out because NORD's 1 reads as an I)
- THE MOVE · 01/03 / DUMBBELL / TOE TOUCH / UPPER ABS · CORE
- THE MOVE · 02/03 / DUMBBELL / FLOOR PRESS / CHEST · SHOULDERS · TRICEPS
- THE MOVE · 03/03 / DUMBBELL / V-UPS / ABS · HIP FLEXORS
- COACH P
- End tag: lockup + @DBELITEFITNESS

None of Coach P's speech is burned in.

## Proposed caption

Day one of Blue Collar fight camp ended on the mats, with Coach P counting every rep of the finisher @center_of_the_ring

#differentbreed #bluecollarboxing #boxing #fightcamp #teaneck

These are the same five tags as the Day 1 "Nonstop" post (calendar id 2026-10-06-blue-collar-day-one-nonstop), and @center_of_the_ring is the coach tag that post used.

## Notes

- Grade: skin-safe correction (contrast 0.2, highlights -0.24, blacks -0.12, vibrance 0.12, saturation -0.04, temp -0.02) in `build/grade.txt`. I ran A2 and lite through grade-compare on 3 frames, and both turned the turf neon and the skin orange.
- Audio: `assets/audio/room-1820.m4a` is the source audio with a gentle compressor (thr -30 dB, 3:1, +6 dB makeup) to even out Coach P near/far. The V-up segment gets +3 dB (lane gain 1.41) and the hook sits at 0.57. Note that the renderer ignores `data-volume` once a volume lane exists, so the gains are set in the lanes. Master: plain gain to -14 LUFS plus alimiter. v2 measures -14.1 LUFS, -1.2 dBFS peak.
- Words: whisper small.en + medium.en on 8 isolated windows, plus Parakeet on the full clip. "Ready, and work time, work, one" agreed everywhere. The V-up coaching line ends differently in every pass ("ceiling" / "sevens" / "tennis" / "descend"), and "feet up/off the ground" is also unclear, so neither is captioned.
- Proxies (gitignored): `assets/footage/img1820.mp4` = zscale hable tonemap of `don-drops/2026-10-08/raw/IMG_1820.mov`, `-g 15`. `assets/audio/don-1820.m4a` is the raw audio (the filename predates the Coach P correction), and `room-1820.m4a` is the compressed version.
- Edit with `python3 build/build.py`, then `npx hyperframes@0.8.98 render -o renders/blue-collar-finisher-raw-v2.mp4`, then master (gain to -14 + alimiter limit=0.84) to `renders/blue-collar-finisher-v2.mp4`. The superseded v1 (`morning-crew-v1.mp4`) is still in renders/.

## Flags

- Room music runs under the whole count (whisper tags it as music). It's unidentified, so IG/FB could mute or claim it. If they mute it, Coach P's count goes too.
- Faces: the member in the white hoodie is close up at the opener and the V-up finish. Members in a blue cap and an orange cap are close at the start of the V-ups. All are unnamed and nobody is tagged.
- The move labels are on-footage overlays in the HyperFrames TRX style, so the count audio never breaks.
- Winning moments: nobody drops a bell or quits a rep. In the wide V-up shots a couple of members lie flat between reps, which is normal pacing.
