# Pull Up Challenge relay reel (built 10/19, for the challenge's last week)

Joey's idea: one running count passed between lifters on the beat. Cut every few reps to the next person,
keep counting, people drop off at their max until the leader finishes. Copy: "are you up for the challenge?"

- Count 1-27 shown in chunks: Amanda 1-2 · April 3-4 · Amanda 5-6 (max) · April 7-10 (max) · Roberto 11-12 ·
  Ahmed 13-14 · Roberto 15-16 · Ahmed 17-18 · Roberto 19-20 · Ahmed 21-22 · Roberto 23-25 (max) · Ahmed 26-27.
  Every rep on screen is that lifter's real Nth rep, so the number is honest. On a max rep the digit goes red and
  the tag flips to their board spot (Women's #2 / #1, Men's #2 / #1).
- Music: Till I Collapse (instrumental), Ajeo Music/, from 54.33s. Riser under the hook + title, drop at 3.0s.
  v2 (Joey 10/20, "end on our end tag"): TIC ducks out into the kit end tag, anthem hook "We are Different Breed"
  (music/Different Breed.mp3 from 48.55) under it; ABSOLUTELY on "different", DIFFERENT. on the downbeat.
  Odd reps on the clap, even reps on the first stomp, cuts on the second stomp. Music untouched, no gym audio.
- Rep tops: Amanda = Don's count -0.2s; April = motion-detected (reel-april); men = Don's count refined by eye
  (Don's count lags up to 0.8s on the slow late reps). Ahmed's rep 1 is before his clip starts, never shown.
- Build: `build-proxies.sh` (tonemap) -> `assemble.py` (per-rep retime onto the grid, writes timing.json)
  -> `build-audio.sh` -> `build-index.py` (fills build/index.template.html) -> `npx hyperframes render`.
- Type: DB Kinetic Type Kit (Archivo var / Instrument Serif / DM Mono), kit end card. Counter corner flips per
  shot to the lifter's empty side.
- v3 (Joey 10/20): coaches' real voices as an undertone (ElevenLabs 2-stem vocals per clip, each count lifted at its
  parakeet word time and dropped 0.12s after its rep beat; music ducks ~4 dB) via `build-audio.py`. "ladies, can you
  beat 10?" card on April's hold (one extra stomp-clap cycle, grid intact). CTA now "guys, can you beat 27?" with
  Don's "twenty-seven". Lifter names are big Archivo punch (were tiny DM Mono tags). A red max digit is cleared at
  the next cut so it never reads as the next lifter's number.
