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
BACKUP="$ROOT/.pigeoncop-dashboard-v12-backup-$STAMP"
mkdir -p "$BACKUP"

cp "$SRC/App.jsx" "$BACKUP/App.jsx"
[[ -f "$SRC/dashboard-deployment-v12.css" ]] && cp "$SRC/dashboard-deployment-v12.css" "$BACKUP/dashboard-deployment-v12.css"
[[ -f "$ROOT/vercel.json" ]] && cp "$ROOT/vercel.json" "$BACKUP/vercel.json"
[[ -f "$ROOT/public/_redirects" ]] && cp "$ROOT/public/_redirects" "$BACKUP/_redirects"

cp "$PKG/App.jsx" "$SRC/App.jsx"
cp "$PKG/dashboard-deployment-v12.css" "$SRC/dashboard-deployment-v12.css"

mkdir -p "$ROOT/public"
cp "$PKG/vercel.json" "$ROOT/vercel.json"
cp "$PKG/_redirects" "$ROOT/public/_redirects"

echo "SUCCESS: PigeonCop Dashboard V12 installed."
echo
echo "This version replaces the previous dashboard shell completely."
echo "- Clean green-only UI"
echo "- No sidebar"
echo "- No giant dashboard gaps"
echo "- Camera is the primary viewport"
echo "- Controls directly below camera"
echo "- Recent detections + compact system status on the right"
echo "- No desktop page scrolling"
echo "- Existing Camera / YOLO / Test Video / custom video / deterrent pipeline is preserved"
echo "- Test Sound play/stop remains connected"
echo "- Dashboard logo links to Home"
echo
echo "Backup: $BACKUP"
echo
echo "Validate:"
echo "  npm run build"
echo
echo "Run:"
echo "  npm run dev"
