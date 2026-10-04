---
workflow: general-video
flow: automation
storyboard: no
message: "Motivational Monday week 1, The Morning Person: the alarm at 4:45, you lace up anyway, and you've already won Monday."
destination: instagram-reels
aspect: 1080x1920
language: en
length: 30s
angle: footage-remix
---

## Intent

First episode of the weekly Motivational Monday series (posts Mon 10/5/2026, 4:30 AM) and the template for every week after it. Classic workout-motivation format: a deep trailer-narrator voice over our hardest training and sparring, cut to a trending trap beat. Joey locked the script (Option A "The Alarm"), the voice and the music. Weekly runbook: `campaigns/motivational-monday/TEMPLATE.md`. Everything week-specific lives in `build/week.json`.

## Music

Travis Scott "RHYNO" (instrumental), full file `assets/audio/rhyno-instrumental.mp3`. build.py cuts `assets/audio/bed.wav` from src 72.996 (reel = src - 72.996, WAV so there's no mp3 priming offset). 118.9 BPM, beat 0.50463s. The grid is anchored on the hats and the slam (src 98.228, confirmed by aubioonset on a 1.5 kHz high-pass); aubiotrack's beat list runs about 0.19s early on this track, so don't trust it raw. Reel 0 sits on a beat, the title lands on beat 3 (1.514) and the first cut is on beat 6 (3.028).

- 0-14.2: full beat, ducked under the VO.
- 14.2 (src 87.2): the breakdown starts under "the lights are on", with a partial return at 16.0-17.9 and sparse hits from 18.0 under "Cold air. Heavy legs. Round one. / By the time this town wakes up".
- 24.3-25.1 (src 97.3-98.1): near silence under "won Monday".
- **25.232 (src 98.228): the slam**, 0.1s after the last word ("Monday" ends at 25.13). This is beat 50.
- 27.250 (beat 54): hard out into the end tag, with the "We are Different Breed" hook (`different-breed-song.mp3` @48.8).

Mix: bed 0.9 open, 0.26 under the VO (VO data-volume 1.4), 0.42/0.3 through the breakdown's partial return, 0.65 in the sparse breakdown, 0.85 on the drop, then a hard out. The carve post-step keeps EQ lanes only. Raw sections: open -12.2, VO verse -14.3, breakdown -17.4/-17.0, drop -11.5, end tag -15.5 LUFS. The two-pass loudnorm measured -14.9 going in, and the final is -14.0 LUFS with -1.0 dBTP.

## VO

Voice: "Don - Movie Trailer Narrator" `JJCR1UICgHnHljtvu5uF` (shared library; the name has nothing to do with Coach Don). eleven_multilingual_v2, stability 0.30, similarity 0.80, style 0.65, speaker boost on. TTS text: `campaigns/motivational-monday/script/week-01-optionA-v2.tts.txt`, with 0.6s line breaks, 0.4s breaks inside the fragment run and 0.3s before the closer's last clause.

I rendered six takes (all 24.9-26.0s, because the voice slowed down when the breaks got shorter). I used take 2 (`script/vo-week01-v2-take2.mp3`): it was the shortest, and whisper spells "Teaneck" correctly on it. Takes 3 and 5 came out as "Tienac" and "Teenak". `build/tighten-vo.py` then trimmed the pauses without touching the speech: line gaps max 0.5s, the two fragment gaps 0.4s, tail 0.3s. That took it from 24.89s to **23.63s** (`assets/audio/vo-week01.mp3`), placed at reel 1.80. Whisper small.en and medium.en both match word for word on the take and on the final mix ("4.45" = 4:45). Word onsets come from Parakeet, snapped to aubioonset and pause ends by `build/vo-words.py`, and are saved in `build/vo-words.json`.

> The alarm goes off at 4:45 and the house is still dark. You could roll over, and nobody would know. You lace up anyway, because over in Teaneck the lights are on and your crew is waiting on you. Cold air. Heavy legs. Round one. By the time this town wakes up, you've already won Monday.

## Cut

| # | Reel in-out | Clip (source) | Proxy ms | Under |
|---|---|---|---|---|
| 0 | 0.000-3.028 | bc5801 (Blue Collar C5801) | 0.55 | opener, title slam at 1.514 |
| 1 | 3.028-4.542 | bc5816 (C5816) | 0.70 | "goes off at 4:45" |
| 2 | 4.542-6.162 | emw3530 (Early Morning Work IMG_3530, 5:53 AM, graded down) | 1.20 | "and the house is still" |
| 3 | 6.162-6.742 | BLACK | | **DARK** (red, glows on black, flickers once) |
| 4 | 6.742-8.579 | img0171 (IMG_0171 sled, 6:38 AM), fades up from black | 1.40 | "You could roll over" |
| 5 | 8.579-10.825 | c5244 (C5244 ropes, 6:23 AM), whip in | 0.80 | "and nobody would know" |
| 6 | 10.825-11.769 | bc5824 (C5824 headgear buckle) | 1.60 | "You lace up" |
| 7 | 11.769-13.120 | bc5794 (C5794 combos into Coach Don's mitts), impact | 0.90 | **ANYWAY** (red block slam) |
| 8 | 13.120-14.634 | c4233 (C4233 ring sparring on the DB logo), whip | 1.00 | "because over in Teaneck" |
| 9 | 14.634-15.644 | img0254 (IMG_0254 shared bag, 6:20 AM) | 1.40 | "the lights are on" |
| 10 | 15.644-16.653 | c5262 (C5262 med-ball slams, 6:17 AM) | 1.00 | "and your crew" |
| 11 | 16.653-17.634 | img9492 (IMG_9492 mitts on the logo), whip | 1.60 | "is waiting on you" |
| 12 | 17.634-18.709 | c5450 (C5450 sled), impact | 1.20 | "Cold air." |
| 13 | 18.709-20.043 | img1402 (IMG_1402 air bike, 5:59 AM), impact | 0.50 | "Heavy legs." |
| 14 | 20.043-21.194 | c2519 (C2519 sparring), impact | 0.80 | "Round one." |
| 15 | 21.194-22.204 | img8871 (IMG_8871 Jacob's ladder) | 1.00 | "By the time" |
| 16 | 22.204-23.213 | img9891 (IMG_9891 treadmill sprint), whip | 1.00 | "this town wakes up" |
| 17 | 23.213-24.222 | c5446 (C5446 mitts) | 1.00 | "you've already" |
| 18 | 24.222-25.232 | bc5851 (C5851 Pair B, close) | 1.60 | "won Monday." (near silence) |
| 19 | 25.232-25.736 | bc5842 (C5842 Pair A), impact + bone flash | 1.80 | DROP, **MONDAY** (red block slam) |
| 20 | 25.736-26.241 | c5055 (C5055 slip), impact | 1.30 | drop |
| 21 | 26.241-27.250 | bc5852 (C5852 Pair B, over-shoulder), impact | 1.20 | drop climax |
| | 27.250-30.150 | end tag | | logo, absolutely-different lockup, @DBELITEFITNESS, hook |

Proxies have a 1.0s handle, so the scout's window starts at 1.0 in the proxy. 21 shots, about 22 different people. The same person is never back to back (c5446 and c5450 may be the same woman, and they sit 5 slots apart).

Captions: word by word on a dark plate at top 1050, 68px. The active word gets the red block, and the emphasis words (4:45, dark, anyway, Teaneck, crew, Cold, Heavy, Round, Monday) keep it. The DARK and ANYWAY hit slams replace their caption word. MONDAY shows in the caption as it's spoken, then slams big on the drop. Title: red kicker "WEEK 01 · THE MORNING PERSON", bone "MOTIVATIONAL", red "MONDAY". It slams in on beat 3 and whips out on the first cut.

## Notes

- **Pick #12 (C4954) dropped.** At full res the main subject reads as a young adult, but a teen boy is prominent behind her, and she was also in the 10/11 heavy-bag reel.
- Pick #2 (IMG_3530 bench) is used under "the house is still" with exposure -0.7. It's a lit gym, so it plays as "the lights are already on here" more than literal dark.
- Added from `clips/pool.json` (proxies built by `build/make-proxies.sh`): IMG_9891, IMG_9492, C2519, C5450, C5851. C5851's source is `New Blue Collar Videos/gym_9_30_26/C5851.MP4`, not the `gym_9_30_26 5` folder that pool.json says.
- Pair B (red tee, blue headgear) appears twice (slots 18 and 21) and Pair A once (19). Teen boys show up only in the background at the ring ropes in C5842, C5816 and C4233.
- Clip audio is muted everywhere. The music is a label track burned in: if FB/IG mutes it, the clean fallback bed is `campaigns/motivational-monday/music/candidates/fallback-bed.mp3`.
- **Videographer credit required.** 14 of the 21 shots are Sony `C####.MP4` pro-rig captures: every Blue Collar 9/30/26 bc* clip, plus C4233, C5055, C5262, C5244, C5446, C5450 and C2519. Per `brand-context/coaches-and-staff.md`, the post must credit 🎥 @veteranwithacamera (tag him and mention him in the caption). The IMG_* clips are Don's iPhone footage and need no credit.

## v1 (built 10/4)

30.17s video, 30.16s audio. `renders/mm-week01-v1.mp4` → `output/2026-10-05/motivational-monday/mm-week01-v1.mp4` (84 MB), phone preview `previews/mm-week01-v1-preview.mp4` (20 MB). To regenerate: `python3 build/build.py && npx --yes hyperframes@0.8.115 render --quiet -o renders/mm-week01-raw.mp4`, then run the loudnorm step from TEMPLATE.md.

## v2 (built 10/4, Joey: "Adrian's Sony landscape clips are too zoomed in")

The 7 unrotated 3840x2160 Sony sources (C5801, C5816, C5824, C5794, C5842, C5852, C5851, all Blue Collar `gym_9_30_26`) are now `frame: "window45"` in `build/week.json`. Each one is a 4:5 crop of the full 2160 source height (1728 wide, centred on the action with pan keys), scaled to 1080x1350 and placed at y=285. Behind it sits the same clip as a gaussian-blurred fill (sigma 10 at quarter size ≈ 40 at full size), brightness -0.16 and saturation 0.5, with soft shadows on the seams. Push on those 7: 1.0→1.03, impact punch 1.08 (shake and the drop flash kept). Everything else is the same as v1 (VO, music, timing, captions, hits, end tag). Two sparring media starts moved to moments where the pair stands close enough to share a 4:5 window: C5842 ms 1.8 → 2.8 (src 10.0-10.5) and C5852 ms 1.2 → 2.4 (src 64.4-65.4, over-shoulder). The rotated Sony clips (C5262, C5244, C5446, C4233, C5055, C2519, C5450) and the iPhone clips are unchanged. The v1 config is kept as `build/week.v1.json`.

30.17s, -14.0 LUFS / -1.0 dBTP. `renders/mm-week01-v2.mp4` → `output/2026-10-05/motivational-monday/mm-week01-v2.mp4` (77 MB), phone preview `previews/mm-week01-v2-preview.mp4` (19 MB), contact strip of the 7 reframed shots `previews/mm-week01-v2-window45-strip.jpg`. Whisper on the v2 mix matches the script word for word.
