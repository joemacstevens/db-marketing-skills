#!/bin/bash
# Soundtrack: Don's live audio on 1x segments, sped chatter (low) + a tick per rep on the 10x
# segments, anthem hook only on the end card (no anthem under gym audio).
set -euo pipefail
cd "$(dirname "$0")"
F=../footage/men; FMT="aformat=sample_rates=48000:channel_layouts=stereo"
T=$(python3 -c "import json;print(' '.join(str(int(t*1000)) for t in json.load(open('reps.json'))['ticks']))")
N=0; TI=(); TL=""; TM=""
for ms in $T; do TI+=(-i assets/audio/tick.wav); TL+="[$((N+3)):a]adelay=${ms}|${ms}[t$N];"; TM+="[t$N]"; N=$((N+1)); done
ffmpeg -nostdin -v error -y -i $F/roberto-IMG_2163.mov -i $F/ahmed-IMG_2164.mov -i assets/audio/anthem-hook.wav "${TI[@]}" -filter_complex "
[1:a]atrim=34.1:35.6,asetpts=PTS-STARTPTS,$FMT[h];
[0:a]atrim=0:2.9,asetpts=PTS-STARTPTS,$FMT[r1];
[0:a]atrim=2.9:44.3,asetpts=PTS-STARTPTS,atempo=2,atempo=5,volume=0.22,$FMT[r2];
[0:a]atrim=44.3:48.6,asetpts=PTS-STARTPTS,afade=t=out:st=4.0:d=0.3,$FMT,apad=pad_dur=1.0[r3];
[1:a]atrim=0:2.3,asetpts=PTS-STARTPTS,$FMT[a1];
[1:a]atrim=2.3:35.6,asetpts=PTS-STARTPTS,atempo=2,atempo=5,volume=0.22,$FMT[a2];
[1:a]atrim=35.6:38.0,asetpts=PTS-STARTPTS,afade=t=out:st=2.0:d=0.4,$FMT,apad=pad_dur=5.73[a3];
[h][r1][r2][r3][a1][a2][a3]concat=n=7:v=0:a=1[gym];
[2:a]$FMT,adelay=22800|22800,volume=0.95[an];
$TL $TM amix=inputs=$N:normalize=0[ticks];
[gym][ticks][an]amix=inputs=3:normalize=0,atrim=0:27.6,alimiter=limit=0.95[out]" -map "[out]" -ar 48000 assets/audio/soundtrack.wav
