---
workflow: general-video
flow: automation
storyboard: yes (approved Cut B "Nonstop", https://claude.ai/artifact/6sNViUbaAgvw4JTJYJogYT)
message: "Day one of Coach P's Blue Collar fight camp: nonstop from the first GO."
destination: instagram-reels, facebook, tiktok
aspect: 1080x1920
language: en
length: 28s
angle: footage-remix
---

## Intent

Compilation of day one of Coach P's (Pablo) Blue Collar Boxing fight-camp team, from the 13 iMessage clips in
`Blue Collar 2026/Day 1/` (720p SDR). Joey picked Cut B "Nonstop" from a three-cut storyboard on 10/6: commercial
song, no VO, Coach P's own callouts are the voice. The 16:9 muted lobby cut is a separate project
(`../2026-10-06-blue-collar-day-one-lobby/`).

## Music

Kanye West, "Black Skinhead". `reels/public/tracks/track-05-kanye-black-skinhead.mp3`, split into ElevenLabs stems
(`scripts/separate-music-stems.mjs`), reel 0 = song 0. Grid: backbeat 0.4025 + N x 0.46152 (130 BPM), fitted with
librosa on the instrumental stem; the stomp intro's drums enter at 3.83, the full kit at ~11.9, big stomp hits at
20.39 and 22.22. Under every Coach P callout the vocal stem drops to 0 and the instrumental ducks to 0.26-0.38, so
he never fights Kanye's vocal. End tag: song out, "We are Different Breed" hook (`different-breed-song.mp3` @48.8).

Delivery: IG can't attach this track through Upload-Post, so `-NO-SONG` is the IG upload (coach audio + DB hook
only) and Joey adds "Black Skinhead" in the IG app from 0:00. The baked file is for review and for FB/TikTok,
with the known risk that Meta/TikTok fingerprint and mute it. The baked file carries the album (explicit) vocal in
the pad flurry (11.9-18.4) and last look (24.4-25.8).

## Cut

| Shot | Reel | Source | What |
|---|---|---|---|
| s00 | 0.000-1.787 | IMG_7835 @45.0 | Coach P shadowboxing at the lens (song intro) |
| s01 | 1.787-4.556 | IMG_7826 @23.58 | rope, countdown room audio from 1.60; title slams 1.787-3.633; **GO!** at 3.83 with the drums |
| s02 | 4.556-5.479 | IMG_7827 @0.3 | rope under "Discipline" |
| s03 | 5.479-6.402 | IMG_7826 @27.0 | rope, close |
| s04 | 6.402-8.710 | IMG_7830 @40.6 | "Pick it up!" (room audio) |
| s05 | 8.710-11.941 | IMG_7834 @26.75 | "Left, right, left, right, nonstop, and work." (room audio) |
| s06-s12 | 11.941-18.402 | 7835 @70.1, 78.8, 49.8, 100.4, 88.4 · 7836 @3.2 · 7837 @1.2 | pad flurry, every 2 beats, full song |
| s13 | 18.402-20.390 | IMG_7830 @57.1 | Coach P cups his hands and calls push-ups; **PUSH-UPS** slam |
| s14 | 20.390-21.632 | IMG_7830 @62.4 | push-ups under "Discipline", on the stomp hit |
| s15 | 21.632-24.402 | IMG_7839 @13.29 (rotated) | "Push it up, push it up, push it up." |
| s16 | 24.402-25.786 | IMG_7835 @133.4 | last exchange |
| end | 25.786-28.236 | | logo, absolutely-different lockup, @DBELITEFITNESS, DB hook |

Landscape sources (7836, 7837, rotated 7839) run in a 1:1 window over a blurred fill (`frame: win11`): at 720p a
4:5 crop would be a 1.9x upscale.

## Captions (verified)

Each line was checked with whisper small.en + medium.en on several window offsets and again on the final mix.
- "Left, right, left, right, nonstop, and work." 6/8 source passes + medium on the mix.
- "Push it up" x3: every engine, every pass.
- "Pick it up!" 3 of 5 passes hear "pick it up" (others "pick up"); "pace" vs "plate" disputed, so it's not captioned.
- "GO!": the countdown's "two, one" is faint in the phone audio, so only GO is captioned.
- The push-up call is "Down for push-ups!" on 5 medium passes but "double push-up" on Parakeet/small, so it gets a
  move label (PUSH-UPS), not a quote.

## Files

`renders/bc-day1-nonstop-v1.mp4` (song baked, -14.0 LUFS / -1.0 dBTP, 28.27s) and `renders/bc-day1-nonstop-v1-NO-SONG.mp4`
(-15.5 LUFS), copied to `output/2026-10-06/blue-collar-day-one/` with `bc-day1-nonstop-v1-preview.mp4` (16 MB).

Regenerate: `python3 build/make-proxies.py && python3 build/build.py && npx --yes hyperframes@0.8.115 render --quiet -o renders/bc-day1-nonstop-raw.mp4`,
then the two-pass loudnorm from `campaigns/motivational-monday/TEMPLATE.md` §8. `python3 build/build.py --no-music`
builds the no-song variant (rebuild without the flag afterwards).

## Draft captions (not scheduled, Joey approves first)

IG: Day one of Blue Collar fight camp. Coach P had the whole floor moving from the first "go" and nobody let up until he called time. Fight Night is November 22, and this crew is already putting in the work. @center_of_the_ring
#differentbreed #bluecollarboxing #boxing #fightcamp #teaneck

FB (<150): Day one of Blue Collar fight camp with Coach P. Nonstop from the first go. Fight Night is November 22.

TikTok: Day one of Blue Collar fight camp with Coach P #boxing #fightcamp #differentbreed #teaneck

Tag Coach P (@center_of_the_ring) in the app, not through the API. No videographer credit needed (all iPhone footage).
