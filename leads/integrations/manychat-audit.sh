#!/usr/bin/env bash
# Manychat read-only audit — dumps the structural API responses into a gitignored folder.
# Run from the repo root (or anywhere — paths are absolute):
#   bash "/Users/joestevens/Projects/Different Breed/db-marketing-skills-main/leads/integrations/manychat-audit.sh"
#
# Requires:
#   - bash, curl, python3 (all standard on macOS)
#   - MANYCHAT_API_KEY in db-marketing-skills-main/.env.local
#
# Writes to: leads/integrations/manychat-audit-raw/<YYYY-MM-DD-HHMM>/
# That folder is gitignored.

set -u

REPO="/Users/joestevens/Projects/Different Breed/db-marketing-skills-main"
ENV_FILE="$REPO/.env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found" >&2
  exit 1
fi

KEY=$(grep '^MANYCHAT_API_KEY=' "$ENV_FILE" | cut -d= -f2-)
if [ -z "$KEY" ]; then
  echo "ERROR: MANYCHAT_API_KEY not set in $ENV_FILE" >&2
  exit 1
fi

STAMP=$(date +%Y-%m-%d-%H%M)
OUT="$REPO/leads/integrations/manychat-audit-raw/$STAMP"
mkdir -p "$OUT"

BASE="https://api.manychat.com/fb"
H="Authorization: Bearer $KEY"

# Read-only endpoints. No subscriber lookups — keeps the audit aggregate.
ENDPOINTS=(
  "page/getInfo"
  "page/getTags"
  "page/getCustomFields"
  "page/getBotFields"
  "page/getOtnTopics"
  "page/getGrowthTools"
  "page/getFlows"
  "page/getWidgets"
)

echo "Manychat audit -> $OUT"
echo "----"

for ep in "${ENDPOINTS[@]}"; do
  fname="${ep//\//_}.json"
  status=$(curl -s -o "$OUT/$fname" -w "%{http_code}" -H "$H" "$BASE/$ep")
  bytes=$(wc -c < "$OUT/$fname" | tr -d ' ')
  printf "  %-26s HTTP %s  %sB\n" "$ep" "$status" "$bytes"
done

# Lightweight index for Claude to read first.
python3 - "$OUT" <<'PY'
import json, os, sys
out = sys.argv[1]
files = sorted(f for f in os.listdir(out) if f.endswith(".json"))
index = {}
for f in files:
    p = os.path.join(out, f)
    try:
        d = json.load(open(p))
        status = d.get("status")
        data = d.get("data")
        if isinstance(data, list):
            shape = f"list[{len(data)}]"
        elif isinstance(data, dict):
            shape = f"dict[{len(data)} keys]"
        else:
            shape = type(data).__name__
        index[f] = {"status": status, "data_shape": shape, "bytes": os.path.getsize(p)}
    except Exception as e:
        index[f] = {"error": str(e), "bytes": os.path.getsize(p)}
json.dump(index, open(os.path.join(out, "_INDEX.json"), "w"), indent=2)
print("\n_INDEX.json written.")
PY

echo
echo "Done. Tell Claude the dump is ready at:"
echo "  $OUT"
