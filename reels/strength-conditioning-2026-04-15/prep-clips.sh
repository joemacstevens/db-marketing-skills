#!/bin/bash
# ────────────────────────────────────────────────────────────────────
# Transcode + trim S&C clips to 1080x1920 @ 30fps for Remotion
# Writes to reels/public/ (Remotion staticFile() path)
# ────────────────────────────────────────────────────────────────────
set -e

MEDIA="/Volumes/Ajeo/Projects/Different Breed/Media Library"
PUBLIC="/Users/joestevens/Projects/db-marketing-skills-main/reels/public"

trim_clip() {
    local src="$1"
    local start="$2"
    local duration="$3"
    local outname="$4"

    echo "→ $outname  (${src##*/} @${start}s for ${duration}s)"

    ffmpeg -y -loglevel error -ss "$start" -i "$MEDIA/$src" -t "$duration" \
        -vf "scale=-1:1920,crop=1080:1920,fps=30" \
        -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
        -an -movflags +faststart \
        "$PUBLIC/$outname"
}

echo "━━━ S&C Feature Reel — Clip Prep ━━━"
echo ""

# ─── Primary: gym_4_15_26 shoot (April 15 2026) ──────────────────

# Beat 1 Slate: step + boxing open (high energy, 23s clip)
trim_clip "2026/gym_4_15_26/Video/C4930.MP4" 2 4 "sc-01-hero.mp4"

# Beat 2 Hero: students boxing with weights (22.5s clip)
trim_clip "2026/gym_4_15_26/Video/C4927.MP4" 1 4 "sc-02-realwork.mp4"

# Beat 5 Text bg: class wide, aerobics + shadow boxing (36.5s clip)
trim_clip "2026/gym_4_15_26/Video/C4928.MP4" 0 4 "sc-05-drive.mp4"

# Beat 7 Grind: close-up boxing combo (key_moment @ 16s)
trim_clip "2026/gym_4_15_26/Video/C4925.MP4" 14 4 "sc-07-grind.mp4"

# Beat 8 Text bg 2: class wide step aerobics + boxing (22.5s clip)
trim_clip "2026/gym_4_15_26/Video/C4924.MP4" 2 4 "sc-08-text2.mp4"

# Beat 9 Scramble: coach watches participants (13s clip)
trim_clip "2026/gym_4_15_26/Video/C4931.MP4" 0 4 "sc-09-motion.mp4"

# Beat 10 Climax hold: coach instruction moment (key_moment @ 26s)
trim_clip "2026/gym_4_15_26/Video/C4928.MP4" 22 5 "sc-10-climax.mp4"

# ─── Supplemental: strict strength clips from 2026 ───────────────

# Beat 3 Explosive: barbell squat — Atoya (already 1080x1920)
trim_clip "February 14, 2026/atoya-putting-in-work-v11-name-fix.mov" 3 4 "sc-03-explosive.mp4"

# Beat 4 Load: sled push — April 12 (720x1280 phone vertical)
trim_clip "April 12, 2026/IMG_5209.mov" 1 4 "sc-04-load.mp4"

# Beat 6 Mid2: TRX class — March 4 pro cam (3840x2160)
trim_clip "2026/gym_3_4_26/Video/C4688.MP4" 0 4 "sc-06-mid2.mp4"

echo ""
echo "━━━ Done! 10 clips staged in reels/public/ ━━━"
echo ""
ls -lh "$PUBLIC"/sc-*.mp4
