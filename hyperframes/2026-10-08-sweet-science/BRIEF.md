---
workflow: general-video
flow: companion
storyboard: no
message: "The sweet science: an evening class doing banded footwork down the turf"
destination: instagram-reels, facebook, threads, tiktok
aspect: 1080x1920
language: en
length: 21.3s
angle: footage-remix
---

## Intent

Don's IMG_1868 (Wed 10/7 7:16 PM, 29.1s, 1280x720 HLG, rotation -90 so 720x1280 portrait), captioned by Don
"The sweet science". A single-file line of members (mostly men) with a mini band around the ankles, stepping
down the turf in boxing stance, coach out front showing the stance at the end. One continuous phone take, cut
into 8 shots on room-song beats, no source moment used twice. Not the Saturday Sweet Science class (Coach
Danny), so no class, day or coach is named on screen.

## Cut (reel time, source time)

| Reel | Source | On screen |
|---|---|---|
| 0.00-1.50 | 18.00-19.50 | opener, no text: the whole line from the front, depth to the back wall |
| 1.50-6.97 | 7.00-12.47 | wide line from behind, everyone in stance. Title 1.5-3.0, THE MOVE card 3.2-6.8 |
| 6.97-8.65 | 2.95-4.63 | whip in, punch-in close on the band at the ankles (grey tee, from behind) |
| 8.65-11.13 | 12.50-14.99 | impact cut, alongside the middle of the line (orange track pants). How-line 8.8-11.0 |
| 11.13-12.85 | 15.75-17.47 | whip in, band close from behind, camera swings back to the line |
| 12.85-14.54 | 19.50-21.19 | impact cut, front of the line coming toward camera |
| 14.54-16.56 | 23.25-25.27 | front of the line close, stance, hands up |
| 16.56-18.23 | 27.35-29.03 | whip in, coach out front showing the stance |
| 18.23-21.33 | | end tag: logo, "what we do is absolutely different" lockup, @DBELITEFITNESS, DB hook |

Dropped: src 0-2.9 (lone member by a bench, then a pan), 4.6-7.0 (pan), 21.2-23.2 (blurred pass of an
orange/white hoodie at the lens), 25.3-27.3 (empty turf).

## On-screen text

- Title (Don's words): THE SWEET / SCIENCE (red slab)
- THE MOVE: BANDED FOOTWORK, works line "Hips · glutes · balance"
- How-line: "Mini band at the ankles, / stay in your stance / and keep it tight"
- End tag: logo, lockup, @DBELITEFITNESS

All text sits in the top ~470px, above the heads in every shot (checked on render frames, not snapshots).

## Audio

- Room track (the clip's own audio, src 0 at reel 0) runs unbroken under all footage, level 1.0. No other bed.
- The room song is NOT the house anthem file (`music/Different Breed.mp3` = "We are Different Breed /
  Discipline, desire, dedication"). Whisper medium.en hears "I'm a different breed... jump rope and hit the
  speed bag... you know the vibe, don't you feel it". Onset cross-correlation against the anthem found no
  consistent offset, and db-bounce v1/alt are instrumentals. Source unknown: maybe another DB track, maybe
  commercial. Joey to confirm.
- End: the room song hits a natural lull at src 17.3-18.1 (about -23 dB RMS), the room fades 18.17-18.53 under
  the whip, and the anthem hook (song 48.8) comes in at 18.08 so "We" lands at 18.25 as the logo stamps.
  Verified by correlation on the final mix (song 49.0 found at reel 18.288, r=0.99).
- Master: render was -16.8 LUFS, +2.9 dB plus alimiter (limit 0.89). Final -14.0 LUFS integrated, -1.0 dBFS peak.

## Grade

"lite" correction (contrast 0.25, highlights -0.2, blacks -0.12, whites 0.02, vibrance 0.22, saturation 0) on a
zscale hable tonemap proxy. A2 turned the turf neon and skin orange in grade-compare (src 9 and 24).

## Files

- `renders/sweet-science-v1.mp4` (1080x1920, 30 fps, 21.33s), `previews/sweet-science-v1-phone.mp4` (540w)
- Edit timings in `build/reel.json`, then `python3 build/build.py` and re-render. The proxy
  (`assets/footage/img1868.mp4`) and room audio (`assets/audio/room-1868.m4a`) are gitignored. Rebuild them
  from `don-drops/2026-10-08/raw/IMG_1868.mov` with the zscale hable chain and `-g 15 -keyint_min 15`.

## Proposed caption

DB members working on their footwork like they always do #differentbreed #boxing #footwork #teaneck

## Flags

- Room song identity (above). If it's commercial, Meta/TikTok may mute the clip audio.
- Coach out front (16.6-18.2, black beanie, camo pants) is not identified and not named.
- Faces are visible throughout (members in a class line, Don filming). Nobody falls or breaks stance in the
  used ranges.
- Drill name is by eye: band at the ankles, boxing stance, stepping down the line. If Don calls it something
  else, change `move.name` in reel.json.
- No CTA card. Built Different had "Book a class · link in bio". Easy to add if Joey wants it.
