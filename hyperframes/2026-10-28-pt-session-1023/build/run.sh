#!/bin/bash
# Rebuild: prep footage + write index.html, apply the Sample cinematic house grade to every footage video, check.
set -e
cd "$(dirname "$0")/.."
python3 build/build.py
npx --yes hyperframes@0.8.199 media-treatment --project . --file index.html --selector 'video.clip' --apply \
  --grading "$(tr -d '\n ' < ../_grades/sample-cinematic.json)"
npx --yes hyperframes@0.8.199 check
