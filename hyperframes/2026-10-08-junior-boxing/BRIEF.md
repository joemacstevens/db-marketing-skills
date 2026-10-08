---
workflow: general-video
flow: companion
storyboard: no
message: "Junior Boxing: Coach Don teaching the youngest kids hands up, footwork, the 1-2 and the roll"
destination: instagram-reels, facebook, threads, tiktok
aspect: 1080x1920
language: en
length: 23.7s
angle: footage-remix
---

## Intent

CJ's two clips of the kids class on the outdoor lot (Wed 10/7, IMG_7884 4:18 PM 4K 120 fps SDR, IMG_7885
4:20 PM 720p iMessage copy). CJ calls it "Junior Boxing and Fitness, the 4:00 class". Kids roughly 5-10, so it
is labeled Junior Boxing, never camp. Coach Don's calls are the spine, one slow-mo hero on a kid's 1-2.

## Cut (reel time, source time)

| Reel | Clip / source | On screen / heard |
|---|---|---|
| 0.00-3.00 | 7884 16.30-19.30 | opener, no text to 1.5: Don bent down setting a little girl's guard (pink top), then he walks off and she holds it. Title 1.5-3.0. Room: Don talking to her (not captioned), "Good. Okay." |
| 3.00-7.65 | 7884 33.10-37.75 | whip in. The line, guards up, "Hands up", then "One step forward. Good." and the kids step in (~6.9). |
| 7.65-9.90 | 7884 42.85-45.10 | impact cut, closer on the line. "One step back. Good." Kids step back ~9.1. |
| 9.90-11.20 | 7884 45.65-46.95 | impact punch-in on the blue-shirt kid in his guard. "One, two." (drops 45.1-45.65, a kid walking back across the line) |
| 11.20-13.90 | 7884 46.95-47.625 at 1/4 speed (native 120 fps) | straight out of the previous shot: his jab, his cross, back to the guard. No room audio, bed up. |
| 13.90-16.55 | 7884 56.00-58.65 | whip in. "Let me see you do this", Don steps in and shows the roll, "Roll, roll." Cut before "it's that way, bro". |
| 16.55-20.70 | 7885 19.10-23.25 (1.4x punch-in, left) | impact cut. Roll drill: Don sweeps his arm over the line, the kids roll under it, "...roll, very good." |
| 20.70-23.70 | | end tag: logo, "what we do is absolutely different" lockup, @DBELITEFITNESS, Three D's hook |

Not used: 7884 0-15 (backlit wide walk-around, sun flare), 19.3-33 (very wide line, kids tiny), 37.8-42.8,
59-64 (kids bent over after the roll, unclear "eyes on me" line); 7885 0-19 (wide, kids small, coaches
swinging arms over the line from far away).

## On-screen text

- Title: JUNIOR / BOXING (red slab), lower third (y ~1060) so it stays off Don's and the girl's faces.
- THE MOVE cards (top): HANDS UP / Guard the face (3.05-5.1), FOOTWORK / Step in · step out (5.2-9.85),
  THE 1-2 / Jab · cross (9.95-13.85), ROLL UNDER / Defense · bend the knees (14.0-20.5).
- Coach chip: COACH DON / Teaching the roll (14.95-16.5), only while Don is the only adult on screen.
  v2: chip moved to the lower right (right 64px, top 1430, slides in from the right) so it no longer sits
  under the centered ROLL, ROLL. caption (top 1250). Nothing else changed from v1.
- End tag: logo, lockup, @DBELITEFITNESS.

## Captions (Don's words, word by word at Parakeet times)

ONE STEP FORWARD. / ONE STEP BACK. / ONE, TWO. / ROLL, ROLL. / ROLL. VERY GOOD.

Verified with whisper medium.en and small.en on isolated source windows (2 framings each), then again on the
final mix. Left off on purpose:
- Opener line ("Look at me, hands are right there", Parakeet) because whisper heard "Here's it right there".
- "Hands up" is in the audio and the card, not captioned (would repeat the card).
- "Let me see you do this" is heard but not captioned (two lines plus the chip got crowded).
- 7885 first "roll" at src 20.96: medium.en heard "Go/Whoa" in 3 of 4 windows, so only the second roll
  (22.16, both models "Roll") and "Very good" (unanimous) are burned in.

## Audio

- Room audio per shot as its own level-matched file (`assets/audio/v-<shot>.m4a`, highpass 90 Hz, each
  window normalised to -17 LUFS so Don sits even across both phones).
- Bed: Three D's v2 from 10.0s (chorus), 0.2 under Don, 0.7 on the slow-mo, out by the end tag. Song start
  (0-5s, "Camp, line it up") avoided so no "camp" lyric plays under a kids-class reel.
- End tag: Three D's "Give me DEDICATION / DEDICATION" hook (46.7) from 20.55.
- Master: render -17.7 LUFS, +3.9 dB plus alimiter (0.89). Final -14.2 LUFS integrated, -0.9 dBFS peak.

## Grade

Lite-cool correction (contrast .25, highlights -.24, blacks -.12, vibrance .12, saturation -.06), same as the
DB youth drills reel. Sources are SDR bt709, no tonemap.

## Files

- `renders/junior-boxing-v2.mp4` (current, chip fix) and `renders/junior-boxing-v1.mp4` (1080x1920, 30 fps, 23.70s), phone previews in `previews/` (540w)
- Edit `build/reel.json`, run `python3 build/build.py`, render, then master:
  `ffmpeg -i renders/junior-boxing-raw.mp4 -af "volume=3.9dB,alimiter=limit=0.89:level=disabled:attack=3:release=60" -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 256k renders/junior-boxing-v1.mp4`
- Proxies (gitignored) rebuild from `don-drops/2026-10-08/raw/`: img7884 `fps=30,scale=1080:1920`, img7885
  `fps=30`, slow-mo `-ss 46.8 -t 1.1 ... setpts=4*(PTS-STARTPTS),fps=30`, all `-g 15 -keyint_min 15`.

## Proposed caption

Our junior boxers learning the basics with Coach Don #differentbreed #boxing #kidsboxing #youthboxing #teaneck

## Flags

- Younger coach (black graphic tee, blue shorts) is on screen through the roll drill (16.6-20.7). Not named,
  and the COACH DON chip ends before that shot so it can't be read as naming him.
- No class time or days printed. schedule.md (Kids Boxing Mon+Wed 4 PM) and the MindBody weekly pattern
  (Jr. Boxing & Fitness Mon/Tue/Wed 4 PM, coach listed as Glenda Ortiz) agree on 4 PM but not on days, and
  MindBody lists Glenda, not Don. Confirm before adding "4 PM" anywhere.
- CJ says "Don and Chayce". The 7885 audio has a kid's name Parakeet reads as "Callie" (src 9.2, 16.8), not
  used. No kid names on screen. No jersey names visible; one background kid's shirt says "ATLAS" (a graphic,
  visible in the slow-mo).
- Clean audio, no profanity. Nobody falls, cries or gets hit in the used ranges.
- Card wording is by eye ("Guard the face", "Bend the knees"). Change in reel.json if Don calls them
  something else.
