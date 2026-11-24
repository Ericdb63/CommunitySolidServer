#!/usr/bin/env bash
# Starts the chaînges test Pod server on http://localhost:3000
# Test data only: the accounts in seed-accounts.json are made up.
#
#   ./chainges/start.sh          keep data between runs (stored in chainges/data)
#   ./chainges/start.sh --fresh  wipe the data and start from the seeded accounts again
set -euo pipefail

cd "$(dirname "$0")/.."
HERE="chainges"
PORT="${PORT:-3000}"

if [[ "${1:-}" == "--fresh" ]]; then
  rm -rf "$HERE/data"
  echo "Wiped $HERE/data"
fi

if [[ ! -d dist ]]; then
  echo "First run: installing and building (a few minutes)..."
  npm ci --no-audit --no-fund
  npm run build
fi

mkdir -p "$HERE/data"

# The server crashed on Node 26 ("Lock expired", 16 Nov 2026 on Samwise) and runs well on
# Node 22. On a newer Node, borrow Node 22 for this command only (downloaded once by npx).
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if (( NODE_MAJOR > 22 )); then
  echo "Node $NODE_MAJOR found; running the server on Node 22 instead."
  NODE=(npx -y -p node@22 node)
else
  NODE=(node)
fi

exec "${NODE[@]}" bin/server.js \
  -c @css:config/file.json \
  -f "$HERE/data" \
  -p "$PORT" \
  -b "http://localhost:$PORT/" \
  --seedConfig "$HERE/seed-accounts.json"
