#!/bin/bash
# Till I Collapse (instrumental) from 54.33: riser under hook + title, drop at 3.0s = first chunk.
# Music only, untouched (no gym audio, no added hits). Fades out under the last of the end card.
set -euo pipefail
cd "$(dirname "$0")"
TOTAL=$(python3 -c "import json;print(json.load(open('timing.json'))['total'])")
M="/Volumes/Ajeo/Projects/Different Breed/Music/Till I Collapse (Instrumental) [HGnpwvw3cwM].mp3"
ffmpeg -nostdin -v error -y -ss 54.33 -t "$TOTAL" -i "$M" -af "afade=t=out:st=$(python3 -c "print($TOTAL-0.8)"):d=0.8,loudnorm=I=-14:TP=-1.0:LRA=11,aformat=sample_rates=48000:channel_layouts=stereo" assets/audio/soundtrack.wav
ffprobe -v error -show_entries format=duration -of csv=p=0 assets/audio/soundtrack.wav
