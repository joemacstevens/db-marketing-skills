#!/usr/bin/env bash
# Master a render's audio to -14 LUFS integrated, -1 dBFS ceiling (plain gain + alimiter), video stream copied.
set -euo pipefail
in="$1"; out="$2"
I=$(ffmpeg -nostdin -i "$in" -vn -af ebur128 -f null - 2>&1 | grep -A3 Summary | awk '/I:/{print $2}')
g=$(python3 -c "print(round(-14 - ($I), 2))")
ffmpeg -nostdin -v error -y -i "$in" -map 0:v -map 0:a -c:v copy \
  -af "volume=${g}dB,alimiter=limit=0.891:attack=3:release=60:level=disabled" -c:a aac -b:a 256k -ar 48000 -movflags +faststart "$out"
echo "in $I LUFS, gain $g dB -> $out"
