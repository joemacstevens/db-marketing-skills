# Men's board reel (10/19)

Source: Don, Don + CJ thread 10/17: IMG_2163 "Roberto Estrada second place with 25", IMG_2164 "first place with 27"
(name 10/18: "First place for the pull-up contest is Ahmed Ashour"). Both sets came right after Don's boxing class.
Clips are iMessage 720p HLG, tonemapped via scripts/hdr-tonemap.sh.

Build: `build-footage.sh` (speed ramp + concat) -> `build-audio.sh` (Don's live count on 1x parts, sped chatter
+ tick per rep on 10x parts, anthem hook only on end card) -> `index.html` (HyperFrames) -> `npx hyperframes render`.
Rep times = parakeet word starts (footage/men/*.parakeet.json), Roberto 12/13 interpolated, his 25 taken
visually at 47.9s; mapped through the ramp in `reps.py`. Ahmed's failed 28th attempt is cut (winning moments only).
