---
workflow: general-video
flow: automation
storyboard: storyboard.html (published: https://claude.ai/artifact/VVX1hzKJyXGG1VvgqJRoDC)
message: "Members say what they lost, in their own words. Thank you, Different Breed."
destination: IG + FB reel, likely boosted (so no commercial music)
aspect: 1080x1920
language: en
length: 44.9s
angle: footage-remix
---

## Intent

Weight-loss montage, Joey's direction 10/27:
- 30–45 s long.
- Open on Don's face asking the question.
- Quick cuts of members saying what they lost.
- Two before-and-afters and Veronica's jeans.
- End on "Thank you, Different Breed."
- InBody clips (Marjan, Dave) are saved for their own video.
- Ashley and James are held for a deeper piece.
- No Blue Collar framing.

Joey on the audio, after approving the storyboard: strip the gym music out of the clips, keep the voices, and put our own composed bed underneath. No commercial music, because this one may get boosted.

## Build

```bash
python3 build/words.py     # Parakeet word times per segment (assets/windows/)
python3 build/stems.py     # ElevenLabs two-stem separation per source clip -> assets/stems/<clip>.vocals.wav
python3 build/cut.py       # 1080x1920 picture + voice per segment (word-snapped), build/cuts.json
python3 build/build.py     # index.html + build/timeline.json (graphics land on the spoken word)
python3 build/mix.py       # assets/mix.wav: voices over the ducked bed, -14 LUFS / -1 dBTP
npx hyperframes media-treatment --project . --file index.html --selector 'video.clip' --apply \
  --grading "$(tr -d '\n ' < ../_grades/sample-cinematic.json)"
npx --yes hyperframes@0.8.207 render --quiet -o renders/thank-you-db-v1.mp4
```

Re-run media-treatment after every build.py, because build.py rewrites index.html without the grade.

## Sound

- **Voices.** Each segment is levelled on its own words to -16 LUFS. They come from the ElevenLabs vocal stem (`stems.py`).
  - Veronica's two segments (08a/08b) use the clip's own audio. Both the stem split and `isolate-voice.mjs` swallowed her laughing "I'm losing inches", and her clip has almost no music in it.
  - The speech-isolation output is kept in `assets/stems/*/isolated.mp3`. On a full-track pass, whisper read it worse than the stems on 5 segments ("Sorry, I lost 40", "Hard was dropped 22") and better on 1 (Veronica's "jeans").
- **Bed.** `build/music/bed-C.mp3`, made with ElevenLabs Music v2 from a composition plan timed to the cut (`plan-C.json`): solo piano intro under Don, lo-fi boom-bap from ~9.8 s, strings, and a final hit on the end card.
  - **v3 (Joey: music came in too late and too quiet):** `build/music/edit-bed.py` writes `bed-C-edit.wav`, which `mix.py` now uses.
    - It keeps only the intro's last bar as a pickup (+9 dB) and repeats one 2-bar loop. The progression cycles every 2 bars, so the splice is seamless.
    - It slows the bed ~3%, so the beat drops at 2.75 s (the camera flip) and the final hit lands at 42.5 s on the end card.
  - The bed sits at 0.50 under gentle ducking (ratio 3), about 9 LU below the voices, and comes up to 0.85 on the end card. Her "Since August" gets +6 dB because it lands on the drop.
  - v3 is the v2 picture remuxed with the new mix. To rebuild audio only: `python3 build/music/edit-bed.py && python3 build/mix.py`, then remux.
  - Alternatives: A and B are synth/chillwave; D is gospel piano with synth pads (Gemini's read). Swap with `python3 build/mix.py --bed=build/music/bed-D.mp3`.
  - The Suno anthem hook ("We are Different Breed") is left off on purpose. In July the Suno account had WAV and stems locked, which looks like the free plan, and free-plan songs aren't licensed for commercial use. Confirm the plan before putting it on a boosted post.

## Cut list

Times are source seconds. Segments are snapped to Parakeet word edges and checked by ear with whisper medium.en on the final mix.

| Seg | Who | Source | In–out |
|---|---|---|---|
| 01a | Don (selfie), then bike member | `Media Library/Teaneck, October 6, 2025/IMG_0330.mov` | 0.00–3.73 |
| 01b | Bike member, "down five pounds" | same | 5.14–9.21 |
| 02 | Gabriel, 15 lbs | `because-of-boxing/testimonials/IMG_5778.mov` | 12.68–16.21 |
| 03 | Gene, 185 → 160 | `because-of-boxing/testimonials/July 20, 2026/IMG_5559.mov` | 70.39–74.22 |
| 04a | Don, phone photo, "two years ago" | `Media Library/2026/April 26, 2026/IMG_5702.mov` | 4.68–7.88 |
| 04b | Grey tee, 30 lbs | same | 10.54–12.61 |
| 05 | FloWater, 40 lbs | `Project Archive/don-drops/2026-09-30/raw/IMG_1571.mov` | 10.54–12.87 |
| 06 | Blue tank, 224 → 184 | `Media Library/August 10, 2025/IMG_4955.mov` | 34.64–39.31 |
| 07a/b | Don, before/now photo | `Media Library/June 26, 2025/IMG_3466.mov` | 13.52–15.42, 17.04–18.61 |
| 08a | Don, Veronica's jeans | `Transformation Montage 2026-10-26/IMG_0313_veronica-jeans_2026-08-22.mov` | 0.00–2.60 |
| 08b | Veronica, "I'm losing inches" (second take) | same | 16.15–18.35 |
| 09a–c | 22-lb man: 22 lbs, cholesterol, "thank you, Different Breed" | `Media Library/February 12, 2025/IMG_7904.mov` | 5.12–7.12, 8.34–10.87, 14.77–16.97 |

The weight bar totals the seven spoken numbers: 5 + 15 + 25 + 30 + 40 + 40 + 22 = 177.
