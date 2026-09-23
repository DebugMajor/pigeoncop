#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
SRC="$ROOT/src"
COMP="$SRC/components"
PKG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -f "$SRC/App.jsx" ]]; then
  echo "ERROR: Run this from the PigeonCop project root (folder containing src/App.jsx)."
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.pigeoncop-dashboard-v6-backup-$STAMP"
mkdir -p "$BACKUP/src" "$BACKUP/src/components" "$BACKUP/public/sounds"

cp "$SRC/App.jsx" "$BACKUP/src/App.jsx"
[[ -f "$COMP/Header.jsx" ]] && cp "$COMP/Header.jsx" "$BACKUP/src/components/Header.jsx"
[[ -f "$SRC/dashboard-v5.css" ]] && cp "$SRC/dashboard-v5.css" "$BACKUP/src/dashboard-v5.css"
[[ -f "$SRC/dashboard-v4.css" ]] && cp "$SRC/dashboard-v4.css" "$BACKUP/src/dashboard-v4.css"

cp "$PKG/App.jsx" "$SRC/App.jsx"
cp "$PKG/Header.jsx" "$COMP/Header.jsx"
cp "$PKG/dashboard-v6.css" "$SRC/dashboard-v6.css"

mkdir -p "$ROOT/public/sounds"
for sound in \
  motion-feedback-soothing-rock.wav \
  deterrent-loud-alert.wav \
  deterrent-high-frequency.wav \
  deterrent-high-frequency-pulse.wav \
  deterrent-gunshot.wav
do
  cp "$PKG/public/sounds/$sound" "$ROOT/public/sounds/$sound"
done

echo "SUCCESS: PigeonCop Dashboard V6 installed."
echo "Layout: camera + compact controls + right-side dashboard in one viewport."
echo "Moved AI engine status into the top monitoring status row."
echo "Removed the oversized right-side telemetry stack."
echo "Green-only theme retained."
echo "Sounds replaced with longer, stronger synthetic assets."
echo "Backup: $BACKUP"
echo
echo "Run:"
echo "  npm run dev"
echo
echo "Open:"
echo "  http://localhost:5173/monitor"
