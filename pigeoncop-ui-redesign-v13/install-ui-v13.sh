#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
SRC="$ROOT/src"
PKG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -f "$SRC/App.jsx" ]]; then
  echo "ERROR: Run this from the PigeonCop project root."
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.pigeoncop-ui-v13-backup-$STAMP"
mkdir -p "$BACKUP"

[[ -f "$SRC/dashboard-deployment-v12_1.css" ]] && cp "$SRC/dashboard-deployment-v12_1.css" "$BACKUP/dashboard-deployment-v12_1.css"
[[ -f "$SRC/dashboard-deployment-v12_2.css" ]] && cp "$SRC/dashboard-deployment-v12_2.css" "$BACKUP/dashboard-deployment-v12_2.css"
[[ -f "$SRC/dashboard-v12.css" ]] && cp "$SRC/dashboard-v12.css" "$BACKUP/dashboard-v12.css"

cp "$PKG/dashboard-deployment-v13.css" "$SRC/dashboard-deployment-v13.css"

python - "$SRC/App.jsx" <<'PY'
from pathlib import Path
import sys

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")
line = 'import "./dashboard-deployment-v13.css";'

if line not in s:
    for anchor in [
        'import "./dashboard-deployment-v12_2.css";',
        'import "./dashboard-deployment-v12_1.css";',
        'import "./dashboard-deployment-v12.css";',
        'import "./dashboard-v9.css";',
        'import "./sound-selection.css";'
    ]:
        if anchor in s:
            s = s.replace(anchor, anchor + "\n" + line, 1)
            break
    else:
        s = line + "\n" + s

p.write_text(s, encoding="utf-8")
PY

echo "SUCCESS: PigeonCop UI V13 installed."
echo "Scrolling is enabled on desktop."
echo "Camera, control deck, recent detections and session status were visually redesigned."
echo "Green-only theme preserved."
echo "Existing App.jsx behavior and Camera detection logic were not replaced."
echo "Backup: $BACKUP"
echo
echo "Run:"
echo "  npm run dev"
echo
echo "Open:"
echo "  http://localhost:5173/monitor"
