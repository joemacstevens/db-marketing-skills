#!/usr/bin/env bash
# Prep footage + write index.html, then apply the house Sample cinematic grade (MEDIUM) to every footage <video>.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 build/build.py
npx --yes hyperframes@0.8.159 media-treatment --project . --file index.html --selector 'video.clip' --apply \
  --grading "$(tr -d '\n ' < ../_grades/sample-cinematic.json)"
