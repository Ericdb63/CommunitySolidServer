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

exec node bin/server.js \
  -c @css:config/file.json \
  -f "$HERE/data" \
  -p "$PORT" \
  -b "http://localhost:$PORT/" \
  --seedConfig "$HERE/seed-accounts.json"
