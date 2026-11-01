#!/usr/bin/env bash
# Master a render's audio to -14 LUFS integrated, -1 dBFS ceiling (plain gain + alimiter), video stream copied.
# Second pass from the raw render adds back what the limiter took (so the result lands on -14, not -14.3).
set -euo pipefail
in="$1"; out="$2"
lufs() { ffmpeg -nostdin -i "$1" -vn -af ebur128 -f null - 2>&1 | grep -A3 Summary | awk '/I:/{print $2}'; }
enc() { ffmpeg -nostdin -v error -y -i "$in" -map 0:v -map 0:a -c:v copy \
  -af "volume=${1}dB,alimiter=limit=0.891:attack=3:release=60:level=disabled" -c:a aac -b:a 256k -ar 48000 -movflags +faststart "$out"; }
I=$(lufs "$in")
g=$(python3 -c "print(round(-14 - ($I), 2))")
enc "$g"
I2=$(lufs "$out")
g2=$(python3 -c "print(round($g + (-14 - ($I2)), 2))")
[ "$g2" != "$g" ] && enc "$g2"
echo "in $I LUFS, gain $g dB -> $I2, second pass gain $g2 dB -> $(lufs "$out") LUFS: $out"
