#!/usr/bin/env bash
# whisper-captions.sh — Generate word-level timed captions from audio/video.
#
# Usage:
#   ./scripts/whisper-captions.sh input.mp4 [output-dir]
#
# Requires local Whisper install:
#   /opt/homebrew/bin/whisper
#
# Output: .json, .srt, .vtt in <output-dir> (default: caption-output/)
# Uses the tiny model (fast, good enough for short gym reels).

set -euo pipefail

INPUT="${1:-}"
OUTDIR="${2:-caption-output}"

if [[ -z "$INPUT" ]]; then
  echo "Usage: $0 <input.mp4> [output-dir]"
  exit 1
fi
if [[ ! -f "$INPUT" ]]; then
  echo "File not found: $INPUT"
  exit 1
fi

WHISPER=/opt/homebrew/bin/whisper
if [[ ! -x "$WHISPER" ]]; then
  echo "Whisper not found at $WHISPER. Install with: brew install openai-whisper"
  exit 1
fi

mkdir -p "$OUTDIR"

echo "[whisper] Transcribing $INPUT → $OUTDIR"
"$WHISPER" "$INPUT" \
  --model tiny \
  --word_timestamps True \
  --output_format json \
  --output_format srt \
  --output_format vtt \
  --output_dir "$OUTDIR"

echo "[whisper] ✅ Done. See $OUTDIR/"
