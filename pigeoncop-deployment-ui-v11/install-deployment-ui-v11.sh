#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
SRC="$ROOT/src"
COMP="$SRC/components"
PKG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -f "$SRC/App.jsx" ]]; then
  echo "ERROR: Run this from the PigeonCop project root."
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.pigeoncop-deploy-ui-v11-backup-$STAMP"
mkdir -p "$BACKUP"

cp "$SRC/App.jsx" "$BACKUP/App.jsx"
[[ -f "$COMP/Header.jsx" ]] && cp "$COMP/Header.jsx" "$BACKUP/Header.jsx"
[[ -f "$COMP/ControlPanel.jsx" ]] && cp "$COMP/ControlPanel.jsx" "$BACKUP/ControlPanel.jsx"
[[ -f "$SRC/dashboard-deploy.css" ]] && cp "$SRC/dashboard-deploy.css" "$BACKUP/dashboard-deploy.css"
[[ -f "$ROOT/vercel.json" ]] && cp "$ROOT/vercel.json" "$BACKUP/vercel.json"
[[ -f "$ROOT/public/_redirects" ]] && cp "$ROOT/public/_redirects" "$BACKUP/_redirects"

mkdir -p "$COMP" "$ROOT/public"

cp "$PKG/App.jsx" "$SRC/App.jsx"
cp "$PKG/Header.jsx" "$COMP/Header.jsx"
cp "$PKG/dashboard-deploy.css" "$SRC/dashboard-deploy.css"
cp "$PKG/vercel.json" "$ROOT/vercel.json"
cp "$PKG/_redirects" "$ROOT/public/_redirects"

echo "SUCCESS: PigeonCop deployment-ready dashboard V11 installed."
echo "Replaced: dashboard shell, header and control deck."
echo "Preserved: Camera/YOLO/Test Video/custom-video/deterrent pipeline."
echo "Desktop: viewport-first, no page scroll."
echo "Green-only theme."
echo "SPA hosting config: vercel.json + public/_redirects"
echo "Backup: $BACKUP"
echo
echo "Next:"
echo "  npm run build"
echo
echo "Then preview:"
echo "  npm run preview"
