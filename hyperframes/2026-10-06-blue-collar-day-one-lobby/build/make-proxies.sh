#!/usr/bin/env bash
# Footage proxies for the BC Day 1 lobby cut (16:9, 1920x1080, muted).
# Each proxy starts PAD seconds before the window's "in" (clamped at 0) so the composition's data-media-start is
# (in - ss); the table in BRIEF.md lists the windows. Sources are 720p SDR bt709 iMessage copies, 30fps.
#   portrait  -> kept at 720x1280 (the 3-up columns are 638x1080, cover-cropped in CSS)
#   landscape -> lanczos upscale to 1920x1080 (full frame)
#   rot       -> IMG_7839 was filmed sideways: transpose=2, then 1920x1080
# Existing files are skipped (delete one to rebuild it).
set -euo pipefail
cd "$(dirname "$0")/.."
SRC="/Users/joestevens/Projects/Different Breed/Blue Collar 2026/Day 1"
PAD=0.5
mkdir -p assets/footage

# id | file | in | out | kind
CLIPS=$(cat <<'EOF'
c7836|IMG_7836.mov|0.4|3.4|land
c7827|IMG_7827.mov|0.4|3.0|port
c7830|IMG_7830.mov|40.4|45.4|port
c7826a|IMG_7826.mov|22.2|24.8|port
c7826b|IMG_7826.mov|27.0|29.4|port
c7826c|IMG_7826.mov|32.1|34.5|port
c7833|IMG_7833.mov|1.0|5.0|port
c7834|IMG_7834.mov|14.0|18.0|port
c7832|IMG_7832.mov|1.0|5.0|port
c7837|IMG_7837.mov|0.3|2.1|land
c7835a|IMG_7835.mov|78.3|81.3|port
c7835b|IMG_7835.mov|87.5|90.5|port
c7835c|IMG_7835.mov|99.5|102.5|port
c7839|IMG_7839.mov|12.9|16.3|rot
EOF
)

enc=(-c:v libx264 -preset medium -crf 18 -g 15 -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709
     -colorspace bt709 -movflags +faststart -an)

while IFS='|' read -r id file in out kind; do
  dst="assets/footage/$id.mp4"
  [ -f "$dst" ] && { echo "skip $dst"; continue; }
  ss=$(python3 -c "print(max(0.0, $in - $PAD))")
  dur=$(python3 -c "print(($out + $PAD) - max(0.0, $in - $PAD))")
  case "$kind" in
    port) vf="fps=30,format=yuv420p" ;;
    land) vf="scale=1920:1080:flags=lanczos,fps=30,format=yuv420p" ;;
    rot)  vf="transpose=2,scale=1920:1080:flags=lanczos,fps=30,format=yuv420p" ;;
  esac
  ffmpeg -nostdin -v error -y -ss "$ss" -t "$dur" -i "$SRC/$file" -vf "$vf" "${enc[@]}" "$dst"
  echo "ok $dst ($file $ss +$dur $kind; media-start offset $(python3 -c "print(round($in - $ss, 3))"))"
done <<<"$CLIPS"
