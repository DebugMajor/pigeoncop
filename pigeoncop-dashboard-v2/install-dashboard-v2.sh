#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
SRC="$ROOT/src"
COMP="$SRC/components"
PKG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -f "$SRC/App.jsx" ]]; then
  echo "ERROR: Run this installer from the PigeonCop project root (folder containing src/App.jsx)."
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.pigeoncop-dashboard-v2-backup-$STAMP"
mkdir -p "$BACKUP"

cp "$SRC/App.jsx" "$BACKUP/App.jsx"
cp "$SRC/App.css" "$BACKUP/App.css"

cp "$PKG/App.jsx" "$SRC/App.jsx"
cp "$PKG/dashboard-v2.css" "$SRC/dashboard-v2.css"

if [[ -f "$SRC/main.jsx" ]]; then
  grep -q 'dashboard-v2.css' "$SRC/App.jsx" || true
fi

echo "SUCCESS: PigeonCop dashboard V2 installed."
echo "Dashboard keeps the existing Camera, YOLO, Test Video, deterrent sound and detection logic."
echo "Added: sidebar navigation, live status header, large camera console, recent detection cards, telemetry, action row and statistics."
echo "Backup: $BACKUP"
echo
echo "Run:"
echo "  npm run dev"
echo
echo "Open:"
echo "  http://localhost:5173/monitor"
