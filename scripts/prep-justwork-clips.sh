#!/bin/bash
# Trim the 5 "Just Work" clips to ~2.5s each centered on their peak_impact_moment.
# Output: jw-1..jw-5.mp4 in reels/public/

set -e
PATH="/opt/homebrew/bin:$PATH"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
MEDIA_ROOT="/Volumes/Ajeo/Projects/Different Breed/Media Library"
SEL="$SCRIPT_DIR/justwork-clip-selection.json"
OUT_DIR="$ROOT_DIR/reels/public"

# Target 2.5s per clip centered on peak
TARGET_DUR=2.5

COUNT=$(jq 'length' "$SEL")
for ((i=0; i<COUNT; i++)); do
  path=$(jq -r ".[$i].path" "$SEL")
  idx=$(jq -r ".[$i].idx" "$SEL")
  act=$(jq -r ".[$i].activity" "$SEL")
  peak=$(jq -r ".[$i].peak.timestamp_sec" "$SEL")
  clip_dur=$(jq -r ".[$i].duration_seconds" "$SEL")

  # Center window on peak, target 2.5s
  half=$(awk "BEGIN{print $TARGET_DUR/2}")
  start=$(awk -v p="$peak" -v h="$half" 'BEGIN{v=p-h; print (v<0?0:v)}')
  # If start at 0, extend forward
  dur="$TARGET_DUR"
  # Clamp to clip length
  max_from_start=$(awk -v c="$clip_dur" -v s="$start" 'BEGIN{print c - s - 0.05}')
  dur=$(awk -v d="$dur" -v m="$max_from_start" 'BEGIN{print (d<m?d:m)}')

  out="$OUT_DIR/jw-$idx.mp4"
  abs="$MEDIA_ROOT/$path"

  echo "─── jw-$idx ($act) ───"
  echo "  src:   $path"
  echo "  peak:  ${peak}s  clip_len: ${clip_dur}s"
  echo "  trim:  [${start}, +${dur}s]"

  ffmpeg -y -loglevel error \
    -ss "$start" -i "$abs" \
    -t "$dur" \
    -an -r 30 \
    -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -movflags +faststart \
    "$out"

  size=$(du -m "$out" | cut -f1)
  echo "  done: ${size}MB"
  echo ""
done

echo "Done."
ls -lh "$OUT_DIR"/jw-*.mp4
