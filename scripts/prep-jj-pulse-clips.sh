#!/bin/bash
# Stage Pulse/adult-focused clips for Jack & Jill "Train Together" reel (22s).
# Output: jjp-*.mp4 in reels/public/

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
MEDIA_ROOT="/Volumes/Ajeo/Projects/Different Breed/Media Library"
SRC_DIR="$MEDIA_ROOT/2026/April 18, 2026"
OUT_DIR="$ROOT_DIR/reels/public"

# role:source:start:duration (s)
declare -a CLIPS=(
  "jjp-1-pulse:IMG_5435.mov:2:3.2"        # Pulse neon sign + TRX leopard-pants
  "jjp-2-trx:IMG_5434.mov:22:3.2"         # TRX tricep peak
  "jjp-3-hips:IMG_5436.mov:20:2.5"        # hip raises peak moment
  "jjp-4-jj:IMG_5453.mov:0:2.5"           # Jack & Jill shirt in Pulse
  "jjp-5-zumba1:IMG_5439.mov:19:3.2"      # Zumba dance joy
  "jjp-6-zumba2:IMG_5455.mov:19:2.2"      # coach arms-up moment
  "jjp-7-group:92e3c23f-5785-4752-ba0b-a74088687475.mov:0:3.2"   # group cheer w/o audio
)

for entry in "${CLIPS[@]}"; do
  IFS=':' read -r role src start dur <<< "$entry"
  out="$OUT_DIR/${role}.mp4"
  abs_src="$SRC_DIR/$src"
  echo "─── $role ─── $src [${start}, +${dur}s]"
  ffmpeg -y -loglevel error \
    -ss "$start" -i "$abs_src" \
    -t "$dur" \
    -an \
    -r 30 \
    -vf "scale='if(gt(a,9/16),-2,1080)':'if(gt(a,9/16),1920,-2)',crop=1080:1920" \
    -c:v libx264 -preset fast -crf 18 \
    -pix_fmt yuv420p \
    -movflags +faststart \
    "$out"
done

ls -lh "$OUT_DIR"/jjp-*.mp4
