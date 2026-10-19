#!/bin/bash
# Coaches' live audio on 1x parts, sped chatter (low) + tick per rep on 4x parts, anthem hook only on the end card.
set -euo pipefail
cd "$(dirname "$0")"
A=../footage/women/april-IMG_6018.mov; FMT="aformat=sample_rates=48000:channel_layouts=stereo"
T=$(python3 -c "import json;print(' '.join(str(int(t*1000)) for t in json.load(open('reps.json'))['ticks']))")
N=0; TI=(); TL=""; TM=""
for ms in $T; do TI+=(-i assets/audio/tick.wav); TL+="[$((N+2)):a]adelay=${ms}|${ms}[t$N];"; TM+="[t$N]"; N=$((N+1)); done
ffmpeg -nostdin -v error -y -i "$A" -i assets/audio/anthem-hook.wav "${TI[@]}" -filter_complex "
[0:a]atrim=35.0:36.5,asetpts=PTS-STARTPTS,$FMT[h];
[0:a]atrim=0:2.3,asetpts=PTS-STARTPTS,$FMT[s1];
[0:a]atrim=2.3:26.4,asetpts=PTS-STARTPTS,atempo=2,atempo=2,volume=0.22,$FMT[s2];
[0:a]atrim=26.4:29.2,asetpts=PTS-STARTPTS,$FMT[s3];
[0:a]atrim=29.2:34.6,asetpts=PTS-STARTPTS,atempo=2,atempo=2,volume=0.22,$FMT[s4];
[0:a]atrim=34.6:39.8,asetpts=PTS-STARTPTS,afade=t=out:st=4.8:d=0.4,$FMT,apad=pad_dur=5.3[s5];
[h][s1][s2][s3][s4][s5]concat=n=6:v=0:a=1[gym];
[1:a]$FMT,adelay=19600|19600,volume=0.95[an];
$TL $TM amix=inputs=$N:normalize=0[ticks];
[gym][ticks][an]amix=inputs=3:normalize=0,atrim=0:24.4,alimiter=limit=0.95[out]" -map "[out]" -ar 48000 assets/audio/soundtrack.wav
