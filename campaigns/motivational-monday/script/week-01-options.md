# Motivational Monday, Week 1: The Morning Person

Posts Mon 10/5/2026, 4:30 AM. Vertical reel, ~30s total:
1.5s footage open, 1.5s title card, VO bed ~22–26s, ~3s DB end tag (logo + "what we do is absolutely different").

Notation:
- `/` short breath (~0.4s)
- `//` held pause (~0.8–1.0s), where the beat drops or a sparring clip gets room to breathe
- **BOLD CAPS** = hit word. Land a hard cut, a punch connecting, or a text slam on the downbeat right as this word is spoken.

All three were checked against `brand-context/writing-rules.md`: no em-dashes, semicolons, rhetorical questions, antithesis, 2-item lists, banned words, or stacked-imperative endings. None of them narrate the footage. They talk to or about the people and the hour.

---

## Option A: "The Alarm" (second person, you), recommended

57 words.

> The alarm goes off at 4:45 and the house is still **DARK**. //
> You could roll over, and nobody would know. //
> You lace up **ANYWAY**, / because over in Teaneck the lights are on / and your crew is waiting on you. //
> Cold air. / Heavy legs. / Round one. //
> By the time this town wakes up, / you've already won **MONDAY**.

Hit words: DARK (black frame or a lights-on flicker), ANYWAY (first big sparring exchange, beat drop), MONDAY (final slam into the end tag).
Footage feel: dark parking lot / hand wraps / early-light run club / then the hardest sparring we have from "Cold air" on.

## Option B: "The Crew" (first-person plural, we)

60 words.

> Five-thirty on a Monday / and the lights are on in Teaneck. //
> We walk in half asleep, / and somebody's already wrapping their hands. //
> Sixteen. / Forty. / **EIGHTY-NINE.** //
> Everybody answers the same **BELL**. //
> The cold doesn't give anybody a pass, / and you won't hear anyone ask for one. //
> We set the tone for the whole week before the sun shows up. //
> This is **DIFFERENT BREED**.

Hit words: EIGHTY-NINE (text slam of the ages over three faces), BELL (round bell SFX + cut to sparring), DIFFERENT BREED (straight into the end tag).
Note: "Eighty-nine" points at Arnold. His story already ran 9/29, but confirm he's OK being referenced again before we burn the number into a text slam. Ages 16 and 40 are illustrative of real member range, not specific people.

## Option C: "Nobody's Watching" (the hour itself, while the city sleeps)

64 words.

> Right now / most of New Jersey is still **ASLEEP**. //
> The streets are empty, / the coffee's brewing, / and in one room in Teaneck the bags are already swinging. //
> It's dark, / it's cold, / and nobody's **WATCHING**. //
> This is the work that shows up later, / in the last round, / when your legs are gone and your hands still go. //
> Monday belongs to whoever gets to it **FIRST**.

Hit words: ASLEEP (cut from still street to first bag hit), WATCHING (beat drop into sparring), FIRST (slam into end tag).
Strongest fit for heavy sparring footage because of the "last round" line.

---

## Recommendation: Option A

It answers Joey's brief most directly (the kind of person who gets up and trains in the dark), and the 4:45 alarm is a hook every early riser recognizes in the first second.
It also puts the crew and Teaneck in the middle, so the community angle is there without a closing sermon, and "you've already won Monday" hands off cleanly to the end tag.

Swap option if Joey wants more fight in it: Option C's line "in the last round, when your legs are gone and your hands still go" can replace "Cold air. Heavy legs. Round one." in A (adds ~10 words, so trim the Teaneck line to "because your crew is waiting on you").

## TTS text (what was actually sent to ElevenLabs for Option A)

`4:45` is spelled out so the voice reads it right. Pauses are SSML breaks (eleven_multilingual_v2 honors `<break time="…"/>`).

```
The alarm goes off at four forty-five, and the house is still dark. <break time="0.9s"/>
You could roll over, and nobody would know. <break time="0.9s"/>
You lace up anyway... because over in Teaneck, the lights are on, and your crew is waiting on you. <break time="0.9s"/>
Cold air. <break time="0.4s"/> Heavy legs. <break time="0.4s"/> Round one. <break time="0.9s"/>
By the time this town wakes up, <break time="0.3s"/> you've already won Monday.
```

(The `...` after "anyway" is a TTS pacing cue only. It never appears in on-screen text or captions.)

## VO takes (Option A)

Settings for the two dramatic takes: eleven_multilingual_v2, stability 0.30, similarity 0.80, style 0.65, speaker boost on. House take uses `scripts/generate-vo.mjs` defaults (0.45 / 0.75 / 0.55). Line timings for each take are in the matching `.srt`.

| File | Voice | ID | Duration | Whisper check |
|---|---|---|---|---|
| `vo-week01-movie-trailer-narrator.mp3` | Don - Movie Trailer Narrator | `JJCR1UICgHnHljtvu5uF` | 24.98s | exact match |
| `vo-week01-rex-thunder.mp3` | Rex Thunder - Deep N Tough | `mtrellq69YZsNwzUSyXh` | 24.85s | exact match |
| `vo-week01-berto-house.mp3` | Berto (house) | `qVpGLzi5EhjW3WGVhOa9` | 23.64s | exact match |
