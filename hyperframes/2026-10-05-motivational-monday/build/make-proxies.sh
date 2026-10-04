#!/usr/bin/env bash
# Footage proxies for the week, driven by build/week.json "clips":
#   { "id": "c5055", "src": "<archive path>", "in": 7.8, "out": 9.3 }                          frame "fill" (default)
#   { "id": "bc5852", "src": "<archive path>", "in": 63.0, "out": 64.6, "frame": "window45", "cx": "1.2:0.55,2.2:0.48" }
#   { "id": "bc5801", "copy": "<path to an existing scout proxy>" }                             (fill only)
# Output: assets/footage/<id>.mp4, SDR 30fps, covering [in - 1.0, out + 1.0] of the source, so the scout's window
# starts at 1.0s inside the proxy (same convention as campaigns/motivational-monday/clips/proxies/).
#
# frame "fill"     : 1080x1920 full-bleed. Vertical (or rotated) sources are scaled + centre-cropped; a landscape
#                    source with "cx" is cropped to a 9:16 slice around cx (tight: use window45 instead for 4K).
# frame "window45" : for UNROTATED landscape sources (Sony C####.MP4 shot horizontal, 3840x2160 with no rotation side
#                    data). <id>.mp4 = a 4:5 crop of the full source height (1728x2160 at 4K) around cx, scaled to
#                    1080x1350; <id>-bg.mp4 = the same clip as a 1080x1920 fill, gaussian-blurred, darkened and
#                    desaturated. build.py stacks them: blurred band behind, window at y=285 (spans 285-1635).
# cx = horizontal centre as a fraction of the source width: one value ("0.42") or a pan "t:cx,t:cx" in proxy-local
#      seconds (linear between keys, held outside). For a sparring pair, frame BOTH fighters.
#
# HDR sources are tonemapped with scripts/hdr-tonemap.sh (scale + crop BEFORE tonemap). -nostdin on every ffmpeg.
# Existing files are skipped (delete one to rebuild it). Sources with no "frame" that are unrotated landscape get a
# SUGGEST line: set "frame": "window45" for them.
set -euo pipefail
cd "$(dirname "$0")/.."
source "/Users/joestevens/Projects/Different Breed/scripts/hdr-tonemap.sh"
mkdir -p assets/footage

cropx() {  # $1 = cx spec, $2 = source width, $3 = crop width -> ffmpeg x expression (commas escaped)
  python3 - "$1" "$2" "$3" <<'PY'
import sys
spec, W, CW = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
keys = [(float(a), float(b)) for a, b in (k.split(":") for k in spec.split(","))] if ":" in spec else [(0.0, float(spec))]
px = lambda c: max(0.0, min(W - CW, c * W - CW / 2))
expr = f"{px(keys[-1][1]):.1f}"
for (t0, c0), (t1, c1) in reversed(list(zip(keys, keys[1:]))):
    a, b = px(c0), px(c1)
    expr = f"if(lt(t\\,{t1})\\,{a:.1f}+({b - a:.1f})*(t-{t0})/{t1 - t0}\\,{expr})"
if len(keys) > 1:
    expr = f"if(lt(t\\,{keys[0][0]})\\,{px(keys[0][1]):.1f}\\,{expr})"
print(expr)
PY
}

probe() {  # $1 = src -> "width height rotation"
  python3 - "$1" <<'PY'
import json, subprocess, sys
d = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
    "stream=width,height:stream_side_data=rotation", "-of", "json", sys.argv[1]], capture_output=True, text=True).stdout)
s = d["streams"][0]
rot = next((int(x.get("rotation", 0)) for x in s.get("side_data_list", []) if "rotation" in x), 0)
print(s["width"], s["height"], rot)
PY
}

python3 -c '
import json
for c in json.load(open("build/week.json"))["clips"]:
    print("|".join(str(c.get(k, "")) for k in ("id", "copy", "src", "in", "out", "cx", "frame")))
' | while IFS='|' read -r id copy src in out cx frame; do
  dst="assets/footage/$id.mp4"
  if [ -n "$copy" ]; then
    [ -f "$dst" ] && { echo "skip $dst"; continue; }
    cp "$copy" "$dst"; echo "copied $dst"; continue
  fi
  [ -f "$src" ] || { echo "MISSING $src (is the Ajeo drive mounted?)"; exit 1; }
  read -r w h rot <<<"$(probe "$src")"
  if [ -z "$frame" ] && [ "$w" -gt "$h" ] && [ "$rot" = "0" ]; then
    echo "SUGGEST $id: unrotated landscape ${w}x${h}, set \"frame\": \"window45\" + \"cx\" in week.json"
  fi
  frame=${frame:-fill}
  ss=$(python3 -c "print(max(0.0, $in - 1.0))")
  dur=$(python3 -c "print(($out + 1.0) - max(0.0, $in - 1.0))")
  if is_hdr "$src"; then tm="$DB_TONEMAP_VF"; else tm="format=yuv420p"; fi
  enc=(-c:v libx264 -preset medium -crf 18 -g 15 -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709
       -colorspace bt709 -movflags +faststart)

  if [ "$frame" = "window45" ]; then
    bg="assets/footage/$id-bg.mp4"
    if [ ! -f "$dst" ]; then
      cw=$(python3 -c "print(int(round($h * 4 / 5 / 2)) * 2)")
      x=$(cropx "${cx:-0.5}" "$w" "$cw")
      ffmpeg -nostdin -v error -y -ss "$ss" -t "$dur" -i "$src" -an \
        -vf "crop=$cw:$h:'$x':0,scale=1080:1350:flags=lanczos,$tm,fps=30" "${enc[@]}" "$dst"
      echo "ok $dst (window45 ${cw}x$h cx=${cx:-0.5}, $ss +$dur)"
    else echo "skip $dst"; fi
    if [ ! -f "$bg" ]; then
      # blur at quarter size then scale up: smooth gaussian, no blocky boxblur, and fast
      ffmpeg -nostdin -v error -y -ss "$ss" -t "$dur" -i "$src" -an \
        -vf "scale=270:480:force_original_aspect_ratio=increase,crop=270:480,$tm,gblur=sigma=10:steps=3,eq=brightness=-0.16:saturation=0.5,scale=1080:1920:flags=bicubic,fps=30" \
        -c:v libx264 -preset medium -crf 22 -g 15 -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 \
        -colorspace bt709 -movflags +faststart "$bg"
      echo "ok $bg (blurred fill)"
    else echo "skip $bg"; fi
    continue
  fi

  [ -f "$dst" ] && { echo "skip $dst"; continue; }
  if [ -n "$cx" ]; then
    sw=$(python3 -c "print(int(round($w * 1920 / $h / 2)) * 2)")
    sc="scale=$sw:1920,crop=1080:1920:'$(cropx "$cx" "$sw" 1080)':0"
  else
    sc="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
  fi
  ffmpeg -nostdin -v error -y -ss "$ss" -t "$dur" -i "$src" \
    -vf "$sc,$tm,fps=30" "${enc[@]}" -c:a aac -b:a 128k "$dst"
  echo "ok $dst (fill, $ss +$dur ${cx:-centre})"
done
