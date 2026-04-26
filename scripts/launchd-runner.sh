#!/bin/bash
# Wrapper for the launchd daily schedule job.
# launchd runs jobs with a minimal PATH — set ours up explicitly so
# node/npx/ffmpeg all resolve.

set -euo pipefail

export PATH="/Users/joestevens/.nvm/versions/node/v22.15.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export NODE_PATH="/Users/joestevens/.nvm/versions/node/v22.15.0/lib/node_modules"
export HOME="/Users/joestevens"
export TZ="America/New_York"

cd /Users/joestevens/Projects/db-marketing-skills-main

# Timestamp each run in the log for easy tailing
echo ""
echo "────────────────────────────────────────────────────────"
echo "  DB Daily Schedule — $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "────────────────────────────────────────────────────────"

exec node scripts/run-daily-schedule.mjs "$@"
