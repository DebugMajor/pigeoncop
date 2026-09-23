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
BACKUP="$ROOT/.pigeoncop-dashboard-css-fix-v12_1-backup-$STAMP"
mkdir -p "$BACKUP"

[[ -f "$SRC/dashboard-deployment-v12.css" ]] && cp "$SRC/dashboard-deployment-v12.css" "$BACKUP/dashboard-deployment-v12.css"
[[ -f "$SRC/dashboard-deployment-v12_1.css" ]] && cp "$SRC/dashboard-deployment-v12_1.css" "$BACKUP/dashboard-deployment-v12_1.css"

cp "$PKG/dashboard-deployment-v12_1.css" "$SRC/dashboard-deployment-v12_1.css"

# Import the fix exactly once. Do not replace App.jsx.
python - "$SRC/App.jsx" <<'PY'
from pathlib import Path
import sys

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")
line = 'import "./dashboard-deployment-v12_1.css";'

if line not in s:
    # Put the override immediately after the existing V12 stylesheet when present.
    anchor = 'import "./dashboard-deployment-v12.css";'
    if anchor in s:
        s = s.replace(anchor, anchor + "\n" + line, 1)
    else:
        # Use the V11/V8 imports as fallback anchors, without changing component logic.
        for anchor in [
            'import "./dashboard-deployment-v11.css";',
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

echo "SUCCESS: Dashboard CSS fix V12.1 installed."
echo "App.jsx logic was not replaced."
echo "Backup: $BACKUP"
echo
echo "Run:"
echo "  npm run dev"
