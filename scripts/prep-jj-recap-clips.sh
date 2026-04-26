#!/bin/bash
# Stage clips for Jack & Jill "Day of Dedication" 25s recap reel.
# Output: jjr-*.mp4 in reels/public/

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
MEDIA_ROOT="/Volumes/Ajeo/Projects/Different Breed/Media Library"
SRC_DIR="$MEDIA_ROOT/2026/April 18, 2026"
OUT_DIR="$ROOT_DIR/reels/public"

# role:source:start:duration
declare -a CLIPS=(
  "jjr-1-kids-turf:IMG_5431.mov:7:4"             # Coach Joe lines kids up on turf — intro energy
  "jjr-2-forty:74C8B980-A946-469F-AE23-E278754382BB.mov:15:3"   # big wide 40-kid shot
  "jjr-3-hands:IMG_5446.mov:10.5:2.5"            # boy jab on DB logo
  "jjr-4-combos:IMG_5443.mov:26.5:3"             # unison punch combos in ring
  "jjr-5-parents:IMG_5434.mov:23:3"              # TRX parents in Pulse
  "jjr-6-pogo:IMG_5441.mov:25:3"                 # mixed pogo — parents + kids
  "jjr-7-zumba:IMG_5439.mov:20:3"                # Zumba joy
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

# Special: group cheer WITH original audio (the "Dedication!" yell)
echo "─── jjr-8-dedication ─── 92e3c23f (with audio) ───"
ffmpeg -y -loglevel error \
  -ss 0 -i "$SRC_DIR/92e3c23f-5785-4752-ba0b-a74088687475.mov" \
  -t 3.5 \
  -r 30 \
  -vf "scale='if(gt(a,9/16),-2,1080)':'if(gt(a,9/16),1920,-2)',crop=1080:1920" \
  -c:v libx264 -preset fast -crf 18 \
  -pix_fmt yuv420p \
  -c:a aac -b:a 192k \
  -movflags +faststart \
  "$OUT_DIR/jjr-8-dedication.mp4"

ls -lh "$OUT_DIR"/jjr-*.mp4
