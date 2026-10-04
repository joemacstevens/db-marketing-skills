# Motivational Monday: The Weekly Formula

One reel every Monday morning (4:30 AM, the gym opens at 4). A deep cinematic voice over our hardest training and sparring footage, set to a trap beat. One theme per week, written by us, in DB's voice. Week 1 (10/5/2026, "The Morning Person") is the template: `week-01-options.md`.

Read `brand-context/writing-rules.md` before every script. Short lines are the genre here, but every line still has to sound like a coach said it out loud, and the footage carries the literal facts (never narrate what's on screen).

---

## 1. Timeline (~30s total)

| Time | What |
|---|---|
| 0.0–1.5s | Footage opener (strongest single moment, no text) |
| 1.5–3.0s | Title card: MOTIVATIONAL MONDAY + week theme (45 frames @30fps) |
| ~3.0–27.5s | VO over the cut (speech is ~23–25s, takes carry ~0.4s tail silence) |
| ~27.5–30.5s | DB end tag: logo + "what we do is absolutely different" lockup |

If a take runs long, rewrite and re-render. Never speed up the audio. VO can start under the last half-second of the title card if we need room.

## 2. Script structure (4 beats)

1. **Hook (1 line, ~10–13 words).** A concrete moment the viewer recognizes instantly, with a specific detail: a time, a place, a temperature, a sound. Week 1: "The alarm goes off at 4:45 and the house is still dark."
2. **Build (1–2 lines, ~20–25 words).** The choice, the cost, and who's waiting. This is where DB lives: Teaneck, the crew, the coaches, the floor. Mix one longer flowing sentence (joined with "and" / "because") against a short one.
3. **Turn (1 line, ~5–8 words).** The beat drop. Usually a 3-item fragment run ("Cold air. Heavy legs. Round one.") or one hard image. Only one fragment run per script. Cut to the hardest sparring here.
4. **Closer (1 line, ~8–12 words).** Lands the theme and hands off to the end tag. Warm and plain, connected to Monday or the week. No stacked commands, no moral of the story, no "remember...". "This is Different Breed." is allowed as a tag line, but not every week.

**Word budget: 55–62 words.** At these settings the deep voices speak ~2.8 words/sec, plus ~4–5s of written breaks, which lands at 23–25s. 65 words is the hard ceiling.

**Hit words: 2–3 per script**, marked in caps in the doc. One in the hook (cut or flicker), one at the turn (beat drop + first big exchange), one on the last word of the closer (slam into end tag). Use the take's `.srt` to find their timestamps.

**Rule checks every week:** no em-dashes, semicolons, rhetorical questions, "it's not X, it's Y", banned words (journey, unlock, truly, grind-speak clichés from the 2025 quote CSVs), lists of exactly 2, or punch-punch-punch command endings. Don't invent stats or quote real people. Members only by name with their OK.

## 3. Voice + settings

**Model:** `eleven_multilingual_v2` (honors SSML `<break time="0.9s"/>`).
**Settings that worked (week 1):** stability `0.30`, similarity_boost `0.80`, style `0.65`, speaker boost on, default speed.

| Voice | ID | Notes from week 1 |
|---|---|---|
| Don - Movie Trailer Narrator (shared library) | `JJCR1UICgHnHljtvu5uF` | Deepest clean take (median pitch ~93 Hz), 24.98s, every pause landed. First pick for the cinematic read. Name is a coincidence, nothing to do with Coach Don. |
| Rex Thunder - Deep N Tough (shared library) | `mtrellq69YZsNwzUSyXh` | Gravelly, rougher (~107 Hz), 24.85s. Ran two of the short fragments together. Good alternate for fight-heavy weeks. |
| Berto, DB house voice | `qVpGLzi5EhjW3WGVhOa9` | ~200 Hz, excited coach read, 23.64s. Baseline for comparison, too bright for this format. |

Tried and passed on: Frank `V2bPluzT7MuirpucVAKH` (very deep but hallucinated extra words at the end), Sekou `YPtbPhafrxFTDAeaPP4w` (deep, but mispronounced Teaneck), Motivational Coach `84Fal4DSXWfp7nJ8emqQ` (only ~129 Hz), Titan `dtSEyYGNJqjrtBArPCVZ` (ran short at 21.9s).

**TTS text conventions:**
- Spell numbers the way they should be said ("four forty-five", "five-thirty").
- `<break time="0.9s"/>` between lines, `0.4s` inside a fragment run, `0.3s` before the closer's last clause.
- An ellipsis after a hit word ("anyway...") stretches it. TTS text only, never on screen.

**Render:**
```bash
cd campaigns/motivational-monday/script
node gen-vo.mjs --voice JJCR1UICgHnHljtvu5uF --text-file week-NN.tts.txt --out vo-weekNN-movie-trailer-narrator.mp3 \
  --stability 0.3 --similarity 0.8 --style 0.65
```
Shared-library voices render directly by ID, no need to add them to the account. The key can't hit `/v1/user` or `/v1/models` (401 missing_permissions), but TTS, `/v1/voices` and `/v1/shared-voices` work.

**QC every take (we can't listen-check from the terminal):**
1. `ffprobe` duration, 22–26s.
2. Transcribe: `whisper-cli -m ~/.cache/whisper-cpp/ggml-small.en.bin -f take.wav -np -osrt -of take` (convert to 16 kHz mono wav first). Words must match the script. Whisper writes Teaneck as "T-neck" when it's said right ("TEE-neck"), and 4:45 as "4.45".
3. Pause map: `ffmpeg -i take.wav -af silencedetect=n=-35dB:d=0.5 -f null -` should show a gap at every `0.9s` break.
4. Joey listens and picks the voice. Then lock that voice for the series so it becomes recognizable.

## 4. Footage + music

- Footage: our most intense sparring, bag work, and conditioning. Winning moments only (no misses, no falls), close shots over wide static, adult footage for this series unless the theme is youth. Credit @veteranwithacamera when it's his footage.
- Beat: trap bed, short intro, main drop within ~3s, ducked under the VO. Put the drop on the turn's hit word.
- On-screen text: hit words only, slammed on the beat. The VO is the caption track, burned-in captions optional.

## 5. Future weekly themes

Each one is a gym trope told the DB way, rooted in a boxing gym with a real community.

1. **The Comeback.** The first week back after an injury, a baby, a bad year, and the floor still knows your name.
2. **Nobody's Watching.** The extra round after class is over, shadowboxing alone in the mirror while the lights go off one row at a time.
3. **The Last Round.** When the legs are gone and the bell is 30 seconds away, the part of training we actually come here for.
4. **No Motivation Required.** The Tuesday in February when nobody feels like it, and the same faces walk in anyway.
5. **Your Future Self.** Train today for the person you'll be at 70, with a nod to members still lacing up decades in (ages only, names with permission).
6. **The Bad Day.** The shift ran long, the kids were a mess, the traffic on Route 4 was brutal, and the heavy bag took all of it.
7. **Iron Sharpens Iron.** Your sparring partner, the one who holds pads for you, pushes the pace, and taps gloves after.
8. **Jersey Weather.** Rain, sleet, a black-ice parking lot in January, and the class is full.
9. **The First Step Through the Door.** For the person who's been watching our reels for months, the hardest rep is walking in, and the room is ready for you.
10. **Sore.** The morning after, when the stairs hurt and you're back on the floor at 5:30 anyway.

Seasonal slots to plan around: Blue Collar Boxing (late Oct/Nov), Thanksgiving week, and the January rush (welcome the new faces, never mock the resolution crowd).
