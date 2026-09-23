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
BACKUP="$ROOT/.pigeoncop-dashboard-v5-backup-$STAMP"
mkdir -p "$BACKUP/src" "$BACKUP/public/sounds"

cp "$SRC/App.jsx" "$BACKUP/src/App.jsx"
if [[ -f "$SRC/dashboard-v4.css" ]]; then cp "$SRC/dashboard-v4.css" "$BACKUP/src/dashboard-v4.css"; fi
if [[ -f "$SRC/dashboard-v5.css" ]]; then cp "$SRC/dashboard-v5.css" "$BACKUP/src/dashboard-v5.css"; fi

for sound in \
  motion-feedback-soothing-rock.wav \
  deterrent-loud-alert.wav \
  deterrent-high-frequency.wav \
  deterrent-high-frequency-pulse.wav \
  deterrent-gunshot.wav
do
  if [[ -f "$ROOT/public/sounds/$sound" ]]; then
    cp "$ROOT/public/sounds/$sound" "$BACKUP/public/sounds/$sound"
  fi
done

cp "$PKG/dashboard-v5.css" "$SRC/dashboard-v5.css"

# Add the V5 stylesheet exactly once.
if ! grep -Fq 'import "./dashboard-v5.css";' "$SRC/App.jsx"; then
  python - "$SRC/App.jsx" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")
anchor = 'import "./dashboard-v4.css";'
line = 'import "./dashboard-v5.css";'
if line not in s:
    if anchor in s:
        s = s.replace(anchor, anchor + "\n" + line, 1)
    else:
        marker = 'import "./sound-selection.css";'
        if marker in s:
            s = s.replace(marker, marker + "\n" + line, 1)
        else:
            s = line + "\n" + s
    p.write_text(s, encoding="utf-8")
PY
fi

mkdir -p "$ROOT/public/sounds"
cp "$PKG/public/sounds/motion-feedback-soothing-rock.wav" "$ROOT/public/sounds/motion-feedback-soothing-rock.wav"
cp "$PKG/public/sounds/deterrent-loud-alert.wav" "$ROOT/public/sounds/deterrent-loud-alert.wav"
cp "$PKG/public/sounds/deterrent-high-frequency.wav" "$ROOT/public/sounds/deterrent-high-frequency.wav"
cp "$PKG/public/sounds/deterrent-high-frequency-pulse.wav" "$ROOT/public/sounds/deterrent-high-frequency-pulse.wav"
cp "$PKG/public/sounds/deterrent-gunshot.wav" "$ROOT/public/sounds/deterrent-gunshot.wav"

echo "SUCCESS: PigeonCop Dashboard V5 installed."
echo "Camera viewport reduced so controls appear sooner."
echo "Green-only dashboard treatment kept."
echo "Current Run stats panel removed as redundant."
echo "Sounds replaced with longer, stronger versions."
echo "Backup: $BACKUP"
echo
echo "Run:"
echo "  npm run dev"
echo
echo "Open:"
echo "  http://localhost:5173/monitor"
