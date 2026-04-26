#!/bin/bash
# Trim selected gym_3_30_26 clips to their best_clip_range windows (extended
# where needed to cover the Remotion beat duration). Output: dsc-{role}.mp4
# in reels/public/. 30fps, original resolution preserved — Remotion covers
# with objectFit.

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
MEDIA_ROOT="/Volumes/Ajeo/Projects/Different Breed/Media Library"
SEL="$SCRIPT_DIR/danny-clip-selection.json"
OUT_DIR="$ROOT_DIR/reels/public"

# Minimum seconds each role needs (Remotion beat duration + small buffer)
# Beat timeline: see StrengthCondDanny30.tsx
#   open 85f (2.83s), danny 85f, power/discipline/athletes 30f each in 85f triptych,
#   earned 105f (3.5s), grind 105f, door 93f (3.1s), climax 132f (4.4s)
declare -a ROLES_DURATIONS=(
  "open:3.5"
  "danny:3.5"
  "power:1.5"
  "discipline:1.5"
  "athletes:1.5"
  "earned:4.0"
  "grind:4.0"
  "door:3.5"
  "climax:5.0"
)

for entry in "${ROLES_DURATIONS[@]}"; do
  role="${entry%%:*}"
  min_dur="${entry##*:}"

  src=$(jq -r ".${role}.path" "$SEL")
  start=$(jq -r ".${role}.best_clip_range.start_sec" "$SEL")
  end=$(jq -r ".${role}.best_clip_range.end_sec" "$SEL")
  clip_dur=$(jq -r ".${role}.duration_seconds" "$SEL")

  # Window length vs needed min
  window=$(echo "$end - $start" | bc -l)
  # Use max(window, min_dur). If needs extension, extend past end_sec.
  use_dur=$(awk -v a="$window" -v b="$min_dur" 'BEGIN{print (a>b?a:b)}')
  # Clamp to not exceed clip duration from start
  max_from_start=$(awk -v cd="$clip_dur" -v s="$start" 'BEGIN{print cd - s - 0.1}')
  use_dur=$(awk -v a="$use_dur" -v b="$max_from_start" 'BEGIN{print (a<b?a:b)}')

  # Offset back slightly for lead-in (0.2s) if there's room
  use_start=$(awk -v s="$start" 'BEGIN{r=s-0.2; print (r<0?0:r)}')

  out="$OUT_DIR/dsc-$role.mp4"
  abs_src="$MEDIA_ROOT/$src"

  echo "─── $role ───"
  echo "  src:   $src"
  echo "  range: ${start}–${end}s (window ${window}s) → trim [${use_start}, +${use_dur}s]"
  echo "  out:   $out"

  ffmpeg -y -loglevel error \
    -ss "$use_start" -i "$abs_src" \
    -t "$use_dur" \
    -an \
    -r 30 \
    -c:v libx264 -preset fast -crf 18 \
    -pix_fmt yuv420p \
    -movflags +faststart \
    "$out"

  size_mb=$(du -m "$out" | cut -f1)
  echo "  done: ${size_mb}MB"
  echo ""
done

echo "All clips staged in $OUT_DIR/dsc-*.mp4"
ls -lh "$OUT_DIR"/dsc-*.mp4
