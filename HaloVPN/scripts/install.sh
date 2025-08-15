#!/usr/bin/env bash
set -euo pipefail

# Determine the directory where this script resides
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR=""

# Walk up from the script location to find the project root (directory containing package.json)
SEARCH_DIR="$SCRIPT_DIR"
while [ "$SEARCH_DIR" != "/" ]; do
  if [ -f "$SEARCH_DIR/package.json" ]; then
    ROOT_DIR="$SEARCH_DIR"
    break
  fi
  SEARCH_DIR="$(dirname "$SEARCH_DIR")"
done

if [ -z "$ROOT_DIR" ]; then
  echo "Error: package.json not found in script directory or any parent directories." >&2
  exit 1
fi

echo "Project root detected: $ROOT_DIR"

cd "$ROOT_DIR"

if [ "$#" -eq 0 ]; then
  npm install
else
  npm install "$@"
fi
