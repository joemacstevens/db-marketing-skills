#!/bin/bash
# Assembles the men's-board reel footage + soundtrack from Don's 10/17 clips.
# Segments (source s): hook Ahmed 34.1-35.6 | Roberto 0-2.9 1x, 2.9-44.3 10x, 44.3-48.6 1x + 1s hold
# | Ahmed 0-2.3 1x, 2.3-35.6 10x, 35.6-38.0 1x + hold through end card. Out: 27.6s.
set -euo pipefail
cd "$(dirname "$0")"
F=../footage/men; R=$F/roberto-IMG_2163.mov; A=$F/ahmed-IMG_2164.mov
source "/Users/joestevens/Projects/Different Breed/scripts/hdr-tonemap.sh"
TM=$(tonemap_prefix "$R")
V="$TM,scale=1080:1920:flags=lanczos,fps=30,setsar=1"
ffmpeg -nostdin -v error -y -i "$R" -i "$A" -filter_complex "
[1:v]trim=34.1:35.6,setpts=PTS-STARTPTS,$V[h];
[0:v]trim=0:2.9,setpts=PTS-STARTPTS,$V[r1];
[0:v]trim=2.9:44.3,setpts=(PTS-STARTPTS)/10,$V[r2];
[0:v]trim=44.3:48.6,setpts=PTS-STARTPTS,$V,tpad=stop_mode=clone:stop_duration=1.0[r3];
[1:v]trim=0:2.3,setpts=PTS-STARTPTS,$V[a1];
[1:v]trim=2.3:35.6,setpts=(PTS-STARTPTS)/10,$V[a2];
[1:v]trim=35.6:38.0,setpts=PTS-STARTPTS,$V,tpad=stop_mode=clone:stop_duration=5.73[a3];
[h][r1][r2][r3][a1][a2][a3]concat=n=7:v=1:a=0,trim=0:27.6[v]" -map "[v]" -an -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 assets/video/men.mp4

# tick: short bright click for each fast-forward rep
ffmpeg -nostdin -v error -y -f lavfi -i "sine=f=2400:d=0.04" -af "afade=t=out:st=0:d=0.04,volume=0.5" -ar 48000 -ac 2 assets/audio/tick.wav
