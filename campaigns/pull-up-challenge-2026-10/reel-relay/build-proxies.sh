#!/bin/bash
# Tonemapped 1080x1920/30fps proxies of the four challenge clips (all-intra-ish GOP so per-chunk seeks are exact).
set -euo pipefail
cd "$(dirname "$0")"
source "/Users/joestevens/Projects/Different Breed/scripts/hdr-tonemap.sh"
mkdir -p build/proxy
for n in amanda-IMG_1822 april-IMG_6018 roberto-IMG_2163 ahmed-IMG_2164; do
  src=../footage-relay/$n.mov
  ffmpeg -nostdin -v error -y -i "$src" -vf "$(tonemap_prefix "$src"),scale=1080:1920:flags=lanczos,fps=30,setsar=1" \
    -an -c:v libx264 -crf 14 -preset fast -g 15 -pix_fmt yuv420p build/proxy/${n%%-*}.mp4 &
done
wait
ls -la build/proxy
