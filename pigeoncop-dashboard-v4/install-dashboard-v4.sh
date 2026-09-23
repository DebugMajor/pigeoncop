#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
SRC="$ROOT/src"
PKG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -f "$SRC/App.jsx" ]]; then
  echo "ERROR: Run this from the PigeonCop project root (folder containing src/App.jsx)."
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.pigeoncop-dashboard-v4-backup-$STAMP"
mkdir -p "$BACKUP"

cp "$SRC/App.jsx" "$BACKUP/App.jsx"
if [[ -f "$SRC/dashboard-v3.css" ]]; then cp "$SRC/dashboard-v3.css" "$BACKUP/dashboard-v3.css"; fi
if [[ -f "$SRC/dashboard-v2.css" ]]; then cp "$SRC/dashboard-v2.css" "$BACKUP/dashboard-v2.css"; fi

cp "$PKG/App.jsx" "$SRC/App.jsx"
cp "$PKG/dashboard-v4.css" "$SRC/dashboard-v4.css"

mkdir -p "$ROOT/public/sounds"
cp "$PKG/public/sounds/deterrent-loud-alert.wav" "$ROOT/public/sounds/deterrent-loud-alert.wav"
cp "$PKG/public/sounds/deterrent-high-frequency.wav" "$ROOT/public/sounds/deterrent-high-frequency.wav"
cp "$PKG/public/sounds/deterrent-high-frequency-pulse.wav" "$ROOT/public/sounds/deterrent-high-frequency-pulse.wav"
cp "$PKG/public/sounds/deterrent-gunshot.wav" "$ROOT/public/sounds/deterrent-gunshot.wav"

echo "SUCCESS: PigeonCop Dashboard V4 installed."
echo "Removed: left sidebar + redundant statistics wall."
echo "Compacted: camera -> controls -> activity."
echo "Theme: green / dark only."
echo "Sounds: extended Loud Alert + High Frequency, plus High Frequency Pulse + Gunshot."
echo "Backup: $BACKUP"
echo
echo "Run:"
echo "  npm run dev"
echo
echo "Open:"
echo "  http://localhost:5173/monitor"
