---
workflow: general-video
flow: companion
storyboard: no
message: "TRX Toning Tornado story: members on TRX rows in the Pulse studio, Coach Carlos cueing"
destination: instagram-stories, facebook-stories
aspect: 1080x1920
language: en
length: 17.95s
angle: footage-remix
---

## Intent

Don's IMG_1867 (Wed 10/7 6:09 PM, 16.1s, 720p30 iPhone HLG, rotation -90), the Pulse studio (hardwood, mirrors,
"Pulse" neon). Wed 6:15 PM is TRX Toning Tornado with Coach Carlos, so this is the class start. A story, so it
is lighter than a reel: one continuous take, the room audio (Carlos's cues) is the spine, one class label, one
move card, three verified cue captions, a short end beat.

## Cut

| Story | Source | On screen / heard |
|---|---|---|
| 0.00-15.95 | IMG_1867 0.00-15.95, one take, slow push 1.00 to 1.06 | group rows by the window (0-7), blue-tee member's high rows (7.6-11.3), camera pans back, Carlos walks through frame (13.3-14.1), group rows again |
| 15.77-15.95 | | whip out |
| 15.95-17.95 | | end beat: DB logo, @cphysiquetraining, "We are different" hook |

## On-screen text (all inside y 260-1600)

- Title (1.0-3.7, lower third y ~1150): TRX (bone) / TONING TORNADO (red slab) / SUSPENSION TRAINING.
- Move card (5.05-12.25, lower band y ~1290): THE MOVE / TRX ROW / BACK · BICEPS · CORE. Name by eye: everyone is
  leaning back in the straps pulling to the chest or face (the blue-tee member's elbows-high version is a high row).
- Captions (y ~1120): SWITCH IT UP. / YES. NICE. / BREATHE ON THE BOTTOM.
- Chip (13.22-14.25, lower right y ~1360): COACH CARLOS / @cphysiquetraining, only while he is in frame.
- End: logo, @cphysiquetraining (NORD renders it in caps).

## Captions (verification)

Parakeet (full clip and isolated windows) for timing, whisper.cpp medium.en + small.en on 2+ isolated source
windows per line, then again on the final mix.
- "Switch it up": unanimous everywhere.
- "Yes. Nice.": unanimous (whisper also hears a trailing "cool" that Parakeet doesn't, left off).
- "Breathe on the bottom": unanimous on source windows; on the final mix small.en heard "ball" on short windows,
  "bottom" on the wider one, medium + Parakeet "bottom" every time.
Dropped:
- "Raise your fist": whisper "raise your fist(s)", Parakeet "twist your fist" / "sweet your fish".
- "Elbow go out" / "Don't move it off": no two engines agree.
- "Core tight, a little tight": Parakeet "poor/more/war", small.en "more/four tight" on tight windows.
- "Let it out on the top": "out" vs "down" vs "on" across engines.

## Coach ID

The bald man in the black/grey lion-graphic tee with heavy forearm tattoos (13.3-14.1) matches the main-site
coach-carlos-card.jpg (head shape, goatee, tattooed forearms). His mouth moves on "breathe on the bottom" and
the cueing voice is constant through the clip, so he is the coach cueing. Chip only while he's in frame.

## Audio

- Room: `assets/audio/v-room.m4a` (src 0-15.95, highpass 90 Hz, loudnorm -17 linear). The gym's own music is
  under the cues already, so no bed.
- End beat: `assets/audio/different-breed-song.mp3` from 48.7 ("We" 48.82, "different" ends 50.66) at 0.85.
- Master: raw -15.5 LUFS, +1.6 dB + alimiter 0.89. Final -14.0 LUFS integrated, -0.9 dBFS peak.

## Grade

Sweet-science "lite" (contrast .25, highlights -.2, blacks -.12, whites .02, vibrance .22, saturation 0) on a
zscale hable tonemap proxy.

## Files

- `renders/trx-story-v1.mp4` (1080x1920, 30 fps, 17.97s), `previews/trx-story-v1-540.mp4`.
- Edit `build/reel.json`, `python3 build/build.py`, `npx hyperframes@0.8.98 render --sdr -o renders/trx-story-raw.mp4`, then
  `ffmpeg -i renders/trx-story-raw.mp4 -af "volume=1.6dB,alimiter=limit=0.89:level=disabled:attack=3:release=60" -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 256k renders/trx-story-v1.mp4`
- Proxy (gitignored): `ffmpeg -i don-drops/2026-10-08/raw/IMG_1867.mov -vf "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,scale=1080:1920:flags=lanczos,fps=30" -g 15 -keyint_min 15 -an assets/footage/img1867.mp4`

## Flags

- Camera is handheld and pans hard at ~7.5 and ~11.4-12.9 (blurry passes). Kept for continuous audio.
- Members' faces visible throughout. Nobody slips or drops a strap in the clip.
- No class days/times printed (memory has Wed 6:15 PM + Sun 10:15 AM from June). Add to the story as a sticker
  if wanted.
- Tag @cphysiquetraining as a story mention in-app (handle is burned in, but not a live mention).
