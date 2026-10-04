# Motivational Monday: weekly runbook

Goal: a new ~30s reel (29-31s) every Monday at 7 AM, built in about 20 minutes of hands-on time. Week 1 (`hyperframes/2026-10-05-motivational-monday/`) is the template. Its `BRIEF.md` is the worked example, and every week-specific value lives in its `build/week.json`.

The shape stays the same every week, so people recognize it. The beat runs from frame 0. The opener shot plays 0-1.5s, the title slams on a beat around 1.5s, and the VO starts under the title at about 1.8s. Captions run word by word on a dark plate, with 2-3 hit words slammed big. The music's breakdown sits under the turn and closer, the drop hits right after the last VO word, and a 2s sparring montage follows. Then the house end tag (DB logo, "absolutely different" lockup, @DBELITEFITNESS) plays with the "We are Different Breed" hook.

Below, ROOT = the repo/worktree root, MM = `ROOT/campaigns/motivational-monday`, and NEW = `ROOT/hyperframes/<date>-motivational-monday`. Run everything in **bash** (`bash -c '...'` or a bash shell). zsh breaks `$VAR:x`-style expansions in ffmpeg filters, and `echo =====` fails in zsh.

---

## 1. Theme + script (5 min)

1. Pick the theme from `MM/script/FORMULA.md` §5 (or a seasonal slot).
2. Read `brand-context/writing-rules.md`. Write **55-62 words** in 4 beats: a hook with a concrete detail, the build (Teaneck, the crew, the floor), a turn (one fragment run or one hard image) and a warm closer. Mark 2-3 hit words. Rules: no em-dashes, semicolons or rhetorical questions, no "it's not X, it's Y", no lists of exactly 2, no stacked-command endings, no invented stats. Don't narrate the footage.
3. Write `MM/script/week-NN.tts.txt`. Spell numbers out the way they're said. Use `<break time="0.6s"/>` between lines, `0.4s` inside the fragment run and `0.3s` before the closer's last clause. An ellipsis after a hit word ("anyway...") is allowed here only, never on screen.

## 2. VO (5 min)

Locked voice: "Don - Movie Trailer Narrator" `JJCR1UICgHnHljtvu5uF` (shared library; the name is a coincidence, nothing to do with Coach Don).

```bash
cd "$MM/script"
for n in 1 2 3 4; do node gen-vo.mjs --voice JJCR1UICgHnHljtvu5uF --text-file week-NN.tts.txt \
  --out vo-weekNN-take$n.mp3 --stability 0.3 --similarity 0.8 --style 0.65 >/dev/null & done; wait
for n in 1 2 3 4; do f=vo-weekNN-take$n.mp3; ffmpeg -nostdin -v error -y -i $f -ar 16000 -ac 1 /tmp/t$n.wav
  echo "take$n $(ffprobe -v error -show_entries format=duration -of csv=p=0 $f)"
  whisper-cli -m ~/.cache/whisper-cpp/ggml-small.en.bin -f /tmp/t$n.wav -np -nt 2>/dev/null; done
```

- Pick the shortest take whose whisper text matches the script word for word. "4.45" for 4:45 is fine. "Teaneck" or "T-neck" means it was said right. "Tienac" or "Teenak" means re-roll.
- Expect the takes to run long. This voice takes ~24.9-26s for 57 words even at 0.6s breaks, because it slows down when the breaks get shorter. **Don't speed up the audio.** Tighten the pauses instead. Copy the take into the new project first (step 5), then:

```bash
cd "$NEW"
python3 build/tighten-vo.py assets/audio/vo-takeN-raw.mp3 assets/audio/vo-weekNN.mp3 --max 0.5 --tail 0.3 --set 7=0.4,8=0.4
```

  It prints the gap list with indices. `--set` pulls the gaps inside the fragment run down to ~0.4s, and the indices change every week. Target **~23.3-23.8s**.
- Re-check the tightened file with whisper small.en and medium.en, then get the word times:

```bash
ffmpeg -nostdin -v error -y -i assets/audio/vo-weekNN.mp3 -ar 16000 -ac 1 assets/transcripts/vo-weekNN.wav
PATH=~/.venvs/parakeet/bin:$PATH node ~/.agents/skills/media-use/scripts/transcribe.mjs \
  --input assets/transcripts/vo-weekNN.wav --out assets/transcripts/vo-weekNN.parakeet.json --engine parakeet
python3 build/vo-words.py assets/transcripts/vo-weekNN.parakeet.json assets/transcripts/vo-weekNN.wav build/vo-words.json
```

  Parakeet gets the words right, but its starts sit on an 80 ms grid and run up to 0.25s early after a pause. `vo-words.py` snaps them to real onsets. Don't use whisper word times: they drift late.

## 3. Music (5 min)

1. Trending check (Billboard Hot R&B/Hip-Hop, IG/TikTok trend lists, gym audio). Same method as `MM/music/RESEARCH.md`. You need a dark trap instrumental with **one stripped breakdown and a slam back in**. When nothing trending fits, use `MM/music/candidates/fallback-bed.mp3` (original, clean).
2. Find the grid and the slam:

```bash
ffmpeg -nostdin -v error -y -i track.mp3 -ac 1 /tmp/m.wav
ffmpeg -nostdin -v error -y -i /tmp/m.wav -af highpass=f=1500 /tmp/m-hi.wav
aubioonset -t 0.4 /tmp/m-hi.wav            # hats: these give the real beat phase
aubiotrack /tmp/m.wav                      # tempo only (RHYNO: its phase was 0.19s early)
ffmpeg -nostdin -v error -ss 60 -t 50 -i /tmp/m.wav -af "asetnsamples=n=11025,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-" -f null -   # RMS per 0.25s: find the breakdown + slam
```

3. Work the timeline backwards from the slam. VO speech end = `vo.at` + the last word's end (silencedetect start of the trailing silence). The drop has to land on a beat about 0.1s after that. Choose drop = beat N with N*beat ≈ 1.8 + speech end + 0.1, then `src_at_reel0 = slam_src - N*beat`, so reel 0 lands on a beat. Set `vo.at = drop - 0.1 - speech_end` (anywhere from 1.6-2.0 is fine). The end tag goes at drop + 4 beats (about 2s of montage). At 118.9 BPM that gives a total of about 30.15s. A ~5-6 beat montage pushes you past 31s.

## 4. Footage (5 min)

- The fast path is `MM/clips/pool.json` (44 verified clips with windows, crop centres and same-person groups). For a theme it doesn't cover, do a fresh scout of the whole Ajeo `Projects/Different Breed/` archive (Media Library index first: `_index/videos.json`, quality >= 6, approved, not avoid). Remember the `coaches_visible` field is unreliable.
- Rules: winning moments only, close shots over wide static, the same person never back to back, adult intensity (drop anyone who might read as under 18 as a featured subject), no Cory White, skip `gym_10_15_25-2971` and `Gym_10_22_25`, no CapCut/produced edits. Look at frames yourself, every time:

```bash
ffmpeg -nostdin -v error -y -i assets/footage/<id>.mp4 -vf "fps=2.5,scale=216:384,tile=9x1" -frames:v 1 /tmp/<id>.jpg
```

  Frame k of the strip is at 0.4*k seconds. ffmpeg's drawtext timestamp labels came out +1.0s off on these proxies, so don't trust them.
- Shot budget: ~17 cuts in the VO section (every 2-3 beats, on the word for the turn's fragments), plus 3 in the montage (1, 1 and 2 beats).
- Credit: Sony `C####.MP4` captures are pro-rig, so the caption credits 🎥 @veteranwithacamera. `IMG_*` and UUID files are Don's iPhone and need no credit.

## 5. Project (2 min)

```bash
cd "$ROOT/hyperframes"
cp -R 2026-10-05-motivational-monday <date>-motivational-monday && cd <date>-motivational-monday
rm -rf renders snapshots assets/footage assets/audio/vo-* assets/audio/bed.wav assets/transcripts/* index.html build/week.v1.json
# keep: assets/fonts, assets/brand, assets/audio/different-breed-song.mp3, build/*.py, build/make-proxies.sh, build/grade-lite.json
cp "$MM/script/vo-weekNN-takeN.mp3" assets/audio/vo-takeN-raw.mp3   # then run step 2's tighten + vo-words
cp <music file> assets/audio/<track>.mp3
```

`node_modules` is a symlink and comes along with the copy. Update `meta.json` id/name.

## 6. Edit `build/week.json` (5 min)

Time specs everywhere: a number (seconds), `"b:N"` (beat N) or `"w:I"` (VO word I, cut 0.03s early so the new shot carries the word). Word indices are positions in `build/vo-words.json`, starting at 0.

| Key | What to change |
|---|---|
| `week`, `date`, `theme`, `title.kicker`, `title.sub` | "Week 02", the theme in a few words |
| `vo.file`, `vo.at` | the tightened VO, start time from step 3 |
| `vo.script` | the exact on-screen script (punctuation as it should show) |
| `vo.chunks` | caption lines, which must spell `vo.script` exactly. **Max 14 characters per chunk** (build asserts this) |
| `vo.emphasis` | words that keep the red block (the hook detail, the place, the turn words, the last word) |
| `hits` | 2-3 big slams. `style`: `black` (word on black, the shot slot is `"clip": null`), `block` (red block over footage), `drop` (red block on the music drop). A hit `at` a word replaces that word's caption chunk, so give the hit word its own chunk |
| `music.file`, `src_at_reel0`, `beat`, `drop`, `levels` | from step 3. Levels are `[reel_t, gain]`: 0.9 open, 0.26 under VO, let it ride 0.4-0.65 in the stripped breakdown, 0.85 on the drop, hard 0 at the end tag (last point = end) |
| `end.at` | drop + 4 beats |
| `clips` | `{"id","copy"}` for an existing (9:16 fill) scout proxy, or `{"id","src","in","out","frame"?,"cx"?}` to build one. `frame`: `"fill"` (default, full-bleed 9:16) or `"window45"` (unrotated landscape sources: a 4:5 window of the full source height at y 285-1635 over a gaussian-blurred, darkened fill, with a light push of 1.0→1.03 and impact punch ≤1.08). `cx` = window centre as a fraction of the source width, or a pan `"t:cx,t:cx"` in proxy-local seconds. Frame BOTH fighters of a sparring pair, and check the frames at the exact `ms` range you use |
| `shots` | in order: `clip`, `at`, `ms` (media start inside the proxy, window = 1.0), optional `fx: "impact"` (punch + shake, flash if on the drop), `tx: "whip"`, `fade_in`, `zoom`, `pos`, `grade` overrides, `note` |

## 7. Build, check, look (5 min)

```bash
bash build/make-proxies.sh
python3 build/build.py          # cuts bed.wav, writes index.html, runs the carve (EQ lanes only); prints the shot table
npx --yes hyperframes@0.8.115 check
npx --yes hyperframes@0.8.115 snapshot --at 0.8,2.6,<each hit>,<drop+0.2>,<end+1.4> --describe false --no-end
```

build.py refuses to build when chunks don't spell the script, a chunk is too long, the same clip is back to back, a shot runs past its proxy, or the VO runs into the drop. Look at the snapshots: the title fits, the captions sit on one line, the hit words are readable, there are no awkward frames, and the right people are in shot.

## 8. Render + loudnorm + deliver (3 min of work, ~1 min render)

```bash
npx --yes hyperframes@0.8.115 render --quiet -o renders/mm-weekNN-raw.mp4
bash -c '
IN=renders/mm-weekNN-raw.mp4; OUT=renders/mm-weekNN-v1.mp4
J=$(ffmpeg -nostdin -hide_banner -i "$IN" -vn -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n "/{/,/}/p")
get(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)[\"$1\"])"; }
ffmpeg -nostdin -v error -y -i "$IN" -c:v copy -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000" -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT"
ffmpeg -nostdin -i "$OUT" -vn -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"'
```

- Check the duration is 29-31s. Whisper the final mix (`whisper-cli ... -np -nt`): every VO word should be there. A trailing "you" is whisper hearing the song hook.
- Section loudness (raw, week 1 reference): open ~-12, VO ~-14 to -17, drop ~-11.5, end tag ~-15.5 LUFS.
- Deliver: `cp renders/mm-weekNN-v1.mp4 "/Users/joestevens/Projects/Different Breed/output/<date>/motivational-monday/"`, and make a phone preview with `ffmpeg -nostdin -i renders/mm-weekNN-v1.mp4 -c:v libx264 -crf 25 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart previews/mm-weekNN-v1-preview.mp4` (it must be < 30 MB; week 1 was 20 MB).
- Update the project `BRIEF.md` (copy week 1's, fill in Music / VO / Cut table / Notes / v1), then draft the captions (IG ≤5 lowercase hashtags, FB ≤150 chars, Threads <500, TikTok one line + ≤4 tags, IG first comment). Joey approves before anything is scheduled.

## Gotchas we hit in week 1

- **aubiotrack's beat phase was wrong by ~0.19s on RHYNO.** Anchor the grid on the slam and the high-passed hat onsets.
- **The bed is cut to WAV by build.py** from the full track (`-ss` after `-i` = sample-accurate). An mp3 cut adds encoder priming and shifts the grid.
- **Shorter SSML breaks don't shorten the take.** The voice slows down to compensate. Tighten pauses in post with `tighten-vo.py`.
- **Parakeet starts run early after pauses, and whisper word times run late.** Use `vo-words.py`.
- **Caption overflow:** at 68px NORD Black Italic, more than ~14 characters (for example "THE ALARM GOES OFF") runs off the 1080 frame. The title's second line tops out at ~190px for 6 letters.
- **Grade can't make a lit gym look dark.** For a "dark" beat, use the black slot + `black` hit style instead of trying to grade footage down.
- pool.json had one wrong folder: C5851 lives in `New Blue Collar Videos/gym_9_30_26/`, not `gym_9_30_26 5/`. make-proxies.sh stops with MISSING when a path is wrong.
- **Sony `C####.MP4` can be landscape or vertical. Check the rotation before you frame it** (Joey, v2: the 9:16 slices of the landscape 4K clips were "too zoomed in"):
  `ffprobe -v error -select_streams v:0 -show_entries stream=width,height:stream_side_data=rotation -of compact <src>`
  `3840|2160` with no rotation = landscape (the Blue Collar `gym_9_30_26` shoot), so use `"frame": "window45"` + `cx`. `rotation=90` = shot vertical (C5262, C5244, C5446, C4233, C5055, C2519, C5450), so keep `fill`. make-proxies.sh prints `SUGGEST <id> ... window45` for any unrotated landscape source with no `frame`. The scout's copied proxies only hold a 9:16 slice, so build window45 proxies from the original source (`src` + `in`/`out`, never `copy`).
- A sparring pair is often wider than the 45% of the frame a 4:5 window shows. Find a moment where they're close (sample the source at 5 fps with a 10% `drawgrid`), move `ms` there, and pan `cx` to follow them. Over-shoulder framing is fine (near fighter partly cut, far fighter fully in).
- **Window seam shadows bleeding onto full-screen shots (v2 bug, fixed in v3).** The window45 `.shot` wrapper can't carry `data-start` (lint `video_nested_in_timed_element`: videos can't nest in a timed element), so it stays in the DOM all reel long and its seam box-shadow painted faint bands over every other shot. build.py now toggles `visibility` on the wrapper at its slot edges on the GSAP timeline. If you touch the window layout, snapshot a couple of FILL shots too and check their top/bottom edges are clean.
- Phone `.mov` files can report landscape width/height with a rotate flag, so make-proxies only crops landscape when you give it `cx` (fill) or `frame: window45`.
- The project pins hyperframes 0.8.124 in package.json, but the house render version is **0.8.115**. Use the explicit `npx --yes hyperframes@0.8.115` commands above. Check prints a pin warning, which is expected.
- The carve post-step strips carve's level lane on purpose. The explicit duck lane sets the balance, and the two stack.
