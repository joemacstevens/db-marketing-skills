#!/bin/bash
# Till I Collapse (instrumental) from 54.33: riser under hook + title, drop at 3.0s = first chunk; untouched,
# no gym audio. Ducks out into the end tag, where our anthem hook "We are Different Breed" takes over
# (music/Different Breed.mp3 from 48.55, so "We" lands on the end tag).
set -euo pipefail
cd "$(dirname "$0")"
read TOTAL E < <(python3 -c "import json;t=json.load(open('timing.json'));print(t['total'],t['endTag'])")
M="/Volumes/Ajeo/Projects/Different Breed/Music/Till I Collapse (Instrumental) [HGnpwvw3cwM].mp3"
A="/Users/joestevens/Projects/Different Breed/music/Different Breed.mp3"
FMT="aformat=sample_rates=48000:channel_layouts=stereo"
AS=$(python3 -c "print(round($E-0.12,3))"); AD=$(python3 -c "print(round($TOTAL-$E+0.12,3))"); MS=$(python3 -c "print(int($AS*1000))")
ffmpeg -nostdin -v error -y -ss 54.33 -t "$E" -i "$M" -ss 48.55 -t "$AD" -i "$A" -filter_complex "
[0:a]afade=t=out:st=$(python3 -c "print($E-0.3)"):d=0.3,$FMT[tic];
[1:a]afade=t=out:st=$(python3 -c "print($AD-0.25)"):d=0.25,$FMT,adelay=$MS|$MS[an];
[tic][an]amix=inputs=2:normalize=0:duration=longest,atrim=0:$TOTAL,loudnorm=I=-14:TP=-1.0:LRA=11,$FMT[out]" -map "[out]" assets/audio/soundtrack.wav
ffprobe -v error -show_entries format=duration -of csv=p=0 assets/audio/soundtrack.wav
