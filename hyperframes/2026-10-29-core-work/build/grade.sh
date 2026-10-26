#!/usr/bin/env bash
# Sample cinematic house grade (MEDIUM) on every footage <video>. Run after build.py, before check/render.
set -euo pipefail
cd "$(dirname "$0")/.."
npx --yes hyperframes@0.8.199 media-treatment --project . --file index.html --selector 'video.clip' --apply \
  --grading "$(tr -d '\n ' < ../_grades/sample-cinematic.json)"
