---
workflow: general-video
flow: automation
storyboard: no
message: "Rough selects: every Tier 1 transformation line, back to back, so Joey can hear them before the montage is cut."
destination: review only (not a post)
aspect: 720x1280
language: en
length: 296s
angle: footage-remix
---

## Intent

A listening reel, not a deliverable. Joey asked (10/27) to hear the Tier 1 lines from
`campaigns/transformation-montage/SOURCE-CLIPS.md` back to back before we pick the montage cut. Every bite plays its
own source audio unbroken at the original timecodes, in SOURCE-CLIPS row order. No music, no grade, no captions.
Each bite has a label: row number + who (red chip), the change (dark chip), and bite count + source file + source
TC (bottom), so Joey can say "drop #8" or "use more of 12b".

Cuts: hard cut between bites of the same person, 0.3 s of black between people. Audio is two-pass loudnorm per
bite to -16 LUFS (linear), so a quiet phone clip sits level with a lav'd B.O.B. interview.

## Cut points

Snapped to Parakeet word edges (`build/words.py`, then `build/cut.py`): 0.25 s before the first word, 0.35 s after
the last, never into a neighbouring word. Every cut was re-heard with whisper medium.en (first and last words
complete). Stacy's quiet answer in b02b is missed by Parakeet, so its out point is fixed at 30.2 s.

| Bite | Row | Who | Source | Source TC |
|---|---|---|---|---|
| b01a | 1 | James Lyons | IMG_5576 | 11.26–21.73 |
| b01b | 1 | James Lyons | IMG_5576 | 97.76–116.49 |
| b02a | 2 | Stacy Smith (voice) | IMG_8761 | 4.74–11.71 |
| b02b | 2 | Stacy Smith (voice) | IMG_8761 | 22.26–30.19 |
| b03 | 3 | Iron Tiger tee | IMG_7904 | 2.78–16.91 |
| b04 | 4 | "King" | IMG_1962 | 11.76–32.43 |
| b05 | 5 | Blue tank | IMG_4955 | 32.04–42.21 |
| b06 | 6 | FloWater | IMG_1571 | 7.12–15.82 |
| b07 | 7 | Grey tee | IMG_5702 | 8.23–20.20 |
| b08 | 8 | Red hoodie | IMG_5637 | 6.14–12.47 |
| b09 | 9 | Gene | IMG_5559 | 67.86–78.76 |
| b10 | 10 | Gabriel | IMG_5778 | 3.88–18.21 |
| b11 | 11 | The couple (produced edit) | 0502 (1).mp4 | 2.63–36.83 |
| b12a | 12 | Veronica, jeans | IMG_0313 copy | 0.00–19.30 |
| b12b | 12 | Veronica, one year | anniversary copy | 20.15–41.02 |
| b12c | 12 | Veronica, 14 lbs | anniversary copy | 47.30–52.00 |
| b12d | 12b | Marjan + Coach Danny | Marjan InBody copy | 12.36–36.73 |
| b13 | 13 | Before/after photo | IMG_3466 | 11.71–21.91 |
| b14 | 14 | Dave | IMG_2104 copy | 4.26–41.13 |

Things heard on the cuts that matter for the real montage:
- **Gabriel** b10 starts at "due to health reasons" (his "my name is Gabriel Gonzalez" intro is left out) and ends
  before his closing "all glory to God", which COMPILATION-COVERAGE.md says no pass resolved twice the same way.
- **Marjan** swears at 30.6 ("it's f***ing great") inside the bite; fine on an adult post, cut it if not.
- **Veronica** says "busting ass" and Coach Mish's name (whisper: "Miss D", Parakeet: "Miss C"; it's Missy).
- **Stacy** b02b: her "she told me to continue going to the gym" is faint under Don.
- **Veronica** b12b: Don's phone drifts off her mid-story (it frames a bin lid around source 32 s). The audio is
  the keeper; the montage needs b-roll or her jeans clip over that stretch.
- **Dave** b14 is 37 s because Don reads the scan twice (skeletal muscle 88 to 93 appears twice). The montage needs one read.

## Weight-loss set (v2, 10/27)

Joey's direction after watching v1: the montage is titled "Thank You, Different Breed" and is about weight loss.
Ashley and James are held for a deeper piece. `build/selects-weight.json` keeps the Tier 1 weight rows (3, 5–10,
Veronica's jeans + 14 lbs, Marjan, the before/after photo, Dave), adds the smaller lines (S1–S4), and ends on King's
"So thank you, Different Breed" as a closer option. Rows keep their v1 cuts; the new ones:

| Bite | Who | Source | Source TC |
|---|---|---|---|
| s1 | Unnamed (name unclear), 8 lbs in 6 classes | IMG_3379 | 11.32–15.19 |
| s2 | Unnamed, on the bike, 5 lbs in 3 weeks (ends on Don's second "three weeks, down five pounds") | IMG_0330 | 4.16–14.16 |
| s3 | David, Blue Collar 2026, 170 to 160 + Coach P's "dropped 10 pounds in 6 weeks" | Coach P Interviews/David.mp4 | 259.08–273.31 |
| s4 | Freddie Loperena Jr., 5 lbs in 2 weeks (Sony, credit @veteranwithacamera) | gym_10_21_26/C6179.MP4 | 541.56–547.36 |
| b04c | King, "So thank you, Different Breed" | IMG_1962 | 29.17–32.17 |

David and Freddie are landscape, so they're letterboxed here; the montage needs a crop decision for each.

## Files

`renders/transformation-selects-v1-raw.mp4` (720x1280) and the phone preview `-preview.mp4`.

Regenerate: `python3 build/words.py && python3 build/cut.py && python3 build/build.py && npx --yes hyperframes@0.8.207 render --quiet -o renders/transformation-selects-v1-raw.mp4`.
`words.py` reuses transcripts in `assets/windows/` (`--force` to redo); `cut.py` only re-cuts bites whose points moved.
Weight set: the same chain with `--set=weight` on all three scripts, rendered to `renders/weight-loss-selects-v1-raw.mp4`.
`index.html` holds whichever set `build.py` wrote last.
