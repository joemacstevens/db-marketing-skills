# End tag v2: the "slam" tag

Joey, 10/28: the old tag was "too polished." He wanted slams that match the song at the end: "We are," then the boom on "Different Breed," then the logo, then the tagline fading in under it. This module replaces `end_tag()` in any DB HyperFrames reel.

Review renders:

- `output/2026-10-28/end-tag-v2/endtag-v2-A.mp4`: the tag on its own, after 0.7 s of black.
- `endtag-v2-A-strip.jpg` in the same folder: a 10-frame strip of that render.
- In context: `output/2026-10-28/coliseum-ready/coliseum-ready-v1.2-endtag2.mp4`.

## What happens, frame by frame

The tag starts at `END`, its frame 0. At that point the song is at 48.88 s. That is the same alignment every DB reel already uses: song 48.80 plays at END - 0.08, after a 0.55 s fade-in under the closer.

| Tag frame | Time | Picture | Song (`Different Breed.mp3`) |
|---|---|---|---|
| 0-1 | 0.00 | The card cuts in with WE already mid-slam: a ghost at 1.5x scale with blur | The band has dropped out (stop-time) after a held "hey" at 48.395 |
| **2** | 0.067 | **WE** settles, with a small jolt | "We" at 48.935 (vowel; the /w/ starts at 48.845) |
| **12** | 0.400 | **ARE** settles, with a small jolt | "are" at 49.295 |
| **25** | 0.833 | **DIFFERENT** settles. Biggest hit: a vertical stomp jolt of 36 px, a 1.06 scale punch of the whole stack, and a red flash (0.85, 0.5, 0.22, 0.08) | BOOM at 49.725: the drum hit and the band coming back in. "Dif-" follows at 49.750 |
| **50** | 1.667 | **BREED.** (red) settles, with a 22 px stomp and a 1.035 punch | "Breed" at 50.555, held until about 51.42 |
| **90** | 3.000 | Smash cut: the words go and the DB logo cuts on with a 24 px jolt and a 1.10 punch | Downbeat at 51.880, band in full. The song has crossfaded to the instrumental stem (51.74 to 51.82) |
| 94 / 98 | 3.13 / 3.27 | "What we do is" (Instrument Serif Italic), then "ABSOLUTELY DIFFERENT." (Archivo, width 62). Each fades in and rises 30 px over 8 frames (kit §8) | Instrumental. Its second "We are Different Breed" is sung at 52.255, but that vocal is gone |
| 104 | 3.47 | `@dbelitefitness` (DM Mono) fades in | The instrumental starts a radio fade at 52.60 |
| 150 | 5.00 | End of the tag | The fade reaches silence at 53.86 |

Every slam settles on the frame whose 1/30 s contains the sung onset. That lands it within -15 to +12 ms of the onset. I checked this on the render by measuring each word's settle frame from pixel bounding boxes. The rendered audio cross-correlates with the song at exactly the planned offset (correlation 0.998).

Type sizes come from fit-to-width, using the DB Kinetic Type Kit's three fonts and one red per frame:

- WE ARE: width 125, 840 px wide.
- DIFFERENT: width 62, 980 px wide.
- BREED.: width 96, red, 980 px wide.
- Logo: 620 px.

Settled phase-1 type sits between y 617 and 1201. The logo phase sits between y 447 and 1536. Both are inside the phone safe zone, which keeps clear of the top 250 px and the bottom 340 px. On jolt frames nothing goes above y 389, and nothing crops at the sides. A seeded grain layer moves every frame over a near-black vignette, which supplies the grit.

## API (`endtag_v2.py`)

```python
import sys; sys.path.insert(0, os.path.join(WT, "hyperframes/_end-tag-v2")); import endtag_v2 as et2

et2.install(ROOT)                                    # copy the tail stem, grain, logo and song into the project's assets/ (skips files already there)
tag_html, tag_s, hook_at_end = et2.end_tag_v2(A, END, track=10)
#   A            the build's ANIMS list; "kf" entries are appended to it
#   tag_html     4 clip layers to add to %TYPE%: bg+flash (track), words (track+1), logo+tagline (track+2), grain (track+3)
#   tag_s        5.0, the tag length, so TOTAL = END + tag_s
#   hook_at_end  48.88, the song time that must be playing at END
audio.append(et2.hook_audio(END, pre=0.55, track=31, song=SONG))
#   two <audio> tags: a-hook (song mp3; up to END it matches the v1 a-hook exactly in src, start, media-start and
#   fade-in) and a-hook-tail (instrumental, tracks 31 and 32)
page = et2.patch_page(page)                          # after the %…% substitution: adds the .et2-* CSS and the "kf" anim kind
print(et2.timing_report(END))                        # each hit as reel seconds, reel frame, and ms off the sung onset
```

Constants you might read: `DUR`, `HIT` (impact frames), `HOOK` (measured song times), `SONG_SRC`, `SONG_LEAD`, `SONG_AT_END`, `XFADE`, `TAIL_OUT`.

The `"kf"` kind gives each element one GSAP keyframes tween, with one value per frame and linear interpolation between values. Every property is therefore a pure function of the frame number, which keeps it seek-safe and deterministic. `patch_page` asserts that the template anchors exist: `</style>` and `const el = m.sel;`. Every `build/template.html` in `hyperframes/` since 10/18 has both.

### Swapping it into a project's `build.py`

The `hyperframes/2026-10-28-coliseum-ready-endtag2/build/build.py` diff is the worked example.

1. Import the module (see above) and add `assert (HOOK_SRC, HOOK_LEAD) == (et2.SONG_SRC, et2.SONG_LEAD)`.
2. Set `DB_TAG = et2.DUR`, so `TOTAL = END + 5.0`.
3. Replace `endB = end_tag(A)` and the `t-end` layer with `et2.end_tag_v2(A, END)`, and append `tag_html` to the layers.
4. Replace the old `a-hook` `<audio>` (and its `hook_pts`) with `et2.hook_audio(END, pre=HOOK_PRE)`.
5. Call `page = et2.patch_page(page)` before writing `index.html`.
6. Call `et2.install(ROOT)`.

Requirements:

- END must be at least 0.63 s, so the hook element doesn't start before 0.
- END should be frame-aligned (END x 30 an integer).
- Tracks 10-13 and 31-32 must be free.
- The project bed should be gone by END, so the "We ... are" stop-time is clean. In the Coliseum reel the bed is already at -49 dB at END.

## Stems

`build/stem-*-40-60.mp3` are the vocal and instrumental stems of song 40-60 s. They come from `scripts/separate-music-stems.mjs` (ElevenLabs `two_stems_v1`). Both lag the mix by 1105 samples at 44.1 kHz, so subtract 0.02506 s.

`assets/audio/song-endtag-v2-tail.wav` is the instrumental stem for song 51.50-54.30, lag-corrected and resampled to 48 kHz. Against the mix it is sample-aligned (1 sample at 48 kHz, correlation 0.996) and level-matched (within 0.3 dB) over the crossfade. Song files and stems are gitignored (`assets/audio/song-*`, `build/stem-*`).

## Standalone review render

```bash
python3 build/build.py && npm run check && npm run render -- -o renders/endtag-v2-A-raw.mp4
bash build/master.sh renders/endtag-v2-A-raw.mp4 ../../output/2026-10-28/end-tag-v2/endtag-v2-A.mp4
python3 build/strip.py ../../output/2026-10-28/end-tag-v2/endtag-v2-A.mp4 ../../output/2026-10-28/end-tag-v2/endtag-v2-A-strip.jpg 21
```

`npm run check` passes. Its `line_unread` warning says the closing tagline is on screen for 1.6-1.8 s, against its general 2 s rule. That gap is the cost of landing the logo on the downbeat at 3.0 s and ending at 5.0 s.
