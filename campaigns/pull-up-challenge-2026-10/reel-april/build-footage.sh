#!/bin/bash
# April Serfass, 10 straight (Chad, 10/19 IMG_6018). Out 24.4s:
# hook src 35.0-36.5 | 0-2.3 1x | 2.3-26.4 4x | 26.4-29.2 1x | 29.2-34.6 4x | 34.6-39.8 1x + hold through end card
set -euo pipefail
cd "$(dirname "$0")"
A=../footage/women/april-IMG_6018.mov
source "/Users/joestevens/Projects/Different Breed/scripts/hdr-tonemap.sh"
TM=$(tonemap_prefix "$A")
V="$TM,scale=1080:1920:flags=lanczos,fps=30,setsar=1"
ffmpeg -nostdin -v error -y -i "$A" -filter_complex "
[0:v]trim=35.0:36.5,setpts=PTS-STARTPTS,$V[h];
[0:v]trim=0:2.3,setpts=PTS-STARTPTS,$V[s1];
[0:v]trim=2.3:26.4,setpts=(PTS-STARTPTS)/4,$V[s2];
[0:v]trim=26.4:29.2,setpts=PTS-STARTPTS,$V[s3];
[0:v]trim=29.2:34.6,setpts=(PTS-STARTPTS)/4,$V[s4];
[0:v]trim=34.6:39.8,setpts=PTS-STARTPTS,$V,tpad=stop_mode=clone:stop_duration=5.3[s5];
[h][s1][s2][s3][s4][s5]concat=n=6:v=1:a=0,trim=0:24.4[v]" -map "[v]" -an -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 assets/video/april.mp4
