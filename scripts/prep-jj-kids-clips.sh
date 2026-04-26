#!/bin/bash
# Stage kids-focused clips for Jack & Jill Next Gen reel (15s).
# Output: jjk-*.mp4 in reels/public/ @ 30fps, portrait preserved.

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
MEDIA_ROOT="/Volumes/Ajeo/Projects/Different Breed/Media Library"
SRC_DIR="$MEDIA_ROOT/2026/April 18, 2026"
OUT_DIR="$ROOT_DIR/reels/public"

# role:source:start:duration  (duration in seconds, trim is -ss start -t dur)
declare -a CLIPS=(
  "jjk-1:IMG_5446.mov:10.5:3.5"    # boy serious jab on DB logo
  "jjk-2:IMG_5443.mov:26.5:3.5"    # kids punching combos in ring
  "jjk-3:IMG_5431.mov:39.5:3.5"    # kid sprint full extension
  "jjk-4:IMG_5452.mov:5.5:3.5"     # girl power punch to bag
  "jjk-5:74C8B980-A946-469F-AE23-E278754382BB.mov:56.5:3.5"  # climax explosive sprint
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
  size_mb=$(du -m "$out" | cut -f1)
  echo "  done: ${size_mb}MB"
done

ls -lh "$OUT_DIR"/jjk-*.mp4
