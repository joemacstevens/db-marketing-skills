# House color grades (HyperFrames)

Reusable `data-color-grading` patches. Apply to the `<video>` elements of any HyperFrames build:

```bash
npx hyperframes media-treatment --project . --file index.html --selector 'video.clip' --apply \
  --grading "$(tr -d '\n ' < ../_grades/sample-cinematic.json)"
```

Then eyeball one frame per clip with `npx hyperframes grade-compare --for <frame.png> --grades '[{"label":"sample","grading":<json>}]'`.
Rooms light differently, so a single bad clip gets its own lighter patch rather than changing the house file.

## sample-cinematic.json (v2, 2026-10-25 evening)

**Default on every new reel** (Don dumps, Adrian drops, everything) unless Joey opts a piece out.
It replaces the old Don "A2" correction grade; don't stack the two.

Matched to Travis Sample's reel at DB (instagram.com/p/De1S896NdOh, @thetravissample). Moody and cool, with real blacks:
teal-green shadows, cool-gray mids, skin kept warm, firm S-curve (blacks pinned at 0, highlights to ~97%),
moderate desaturation, greens pulled hard (turf), light grain + vignette.

**v2 vs v1:** on the first real batch (Don drop 10/23-10/25) Joey said v1 looked "a little washed out on all of them".
v1 lifted blacks to 0.021, capped highlights at 0.847 and cut saturation 22%. On top of the already-soft hable
tonemap, that reads gray. v2 = contrast 0.24, blacks -0.14, master `[0,0]…[1,0.97]`, saturation -0.12,
and the turf pull is 10% stronger than v1 (more contrast makes the turf glow otherwise).
v1 is kept as `sample-cinematic-v1-flat.json`; never go back to it as the default.

**v3 (current, same night):** Joey: v2 "has this kind of bloom effect… this blur" on all four reels. The cause was
v2's white walls pushed to ~97% under fluorescents, with a 0.24 vignette darkening the edges, so the center glowed.
Grain 0.119 then turned to smear under compression. v3 = v2 with grain 0, vignette 0.08 and whites capped at 0.93
(master `…[0.75,0.77],[0.9,0.875],[1,0.93]`). v2 is kept as `sample-cinematic-v2-bloom.json`.
**Pair it with a light sharpen on footage prep:** append `unsharp=5:5:0.6:5:5:0` after the tonemap + scale (and on
Topaz files). iPhone footage is soft from in-camera noise reduction; this crisps edges without halos at phone size.
Don't add grain or a heavy vignette back to this look.

- **Source order:** Don's iPhone HLG clips must be tonemapped to SDR first (`scripts/hdr-tonemap.sh`), then graded.
  Adrian's Sony C#### clips are already bt709.
- **Ceiling:** gets ~70% of his look. His frames are dark corners with a key light on the face; our rooms are bright
  white walls under overhead fluorescents. Low angles, close shots and darker corners land closest.
- **Don't add these controls:** `hueCurves.hueVsLuma` speckles dark skin; `adjust.highlights` / `adjust.whites` leave
  blotches on white ceilings and walls. Highlight roll-off lives in `curves.master` instead.
- **Skin is protected** in `hueVsSaturation` (18°–38° held at 0). Widening the red pull past ~8° makes skin ashy.
- **Strength:** v1 came from `k=0.85` in the recipe (LIGHT = 0.6, STRONG = 1.1); v2 was hand-tuned from it.
  v1 test reel with before/after split: `hyperframes/2026-10-25-sample-grade-test/`.
- **Judge it on a rendered frame next to the ungraded tonemapped source** (`grade-compare` shows both). If the
  graded frame's blacks look grayer than the source's, the grade is too flat.
