#!/bin/bash
# 3.5s SDR proxies of the four grade-test clips (Don HLG gets tonemapped, scaled first).
set -e
cd "$(dirname "$0")/.."
P="/Volumes/Ajeo/Projects/Different Breed"
TM='zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p'
clip() { # src out start vf
  ffmpeg -nostdin -v error -y -ss "$3" -t 3.5 -i "$1" -an -vf "$4" -r 30 -c:v libx264 -crf 16 -preset fast \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 "assets/footage/$2.mp4"
}
clip "$P/Incoming Videos/gym_10_20_26/C6170.MP4" c6170 29.3 "scale=1920:-2,format=yuv420p"
clip "$P/Incoming Videos/gym_10_20_26/C6164.MP4" c6164 23.3 "scale=1920:-2,format=yuv420p"
clip "$P/Project Archive/Blue Collar 2026/Dred 10-9/IMG_9332.MOV" img9332 1.5 "scale=-2:1920,$TM"
clip "$P/Project Archive/Blue Collar 2026/Dred 10-9/IMG_9330.MOV" img9330 0.8 "scale=-2:1920,$TM"
for c in c6170 c6164 img9332 img9330; do cp "assets/footage/$c.mp4" "assets/footage/$c-before.mp4"; done
