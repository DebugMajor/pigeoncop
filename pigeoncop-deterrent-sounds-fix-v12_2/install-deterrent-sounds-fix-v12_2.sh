#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
APP="$ROOT/src/App.jsx"
PKG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -f "$APP" ]]; then
  echo "ERROR: Run this from the PigeonCop project root (folder containing src/App.jsx)."
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.pigeoncop-deterrent-sounds-fix-v12_2-backup-$STAMP"
mkdir -p "$BACKUP"
cp "$APP" "$BACKUP/App.jsx"

python - "$APP" <<'PY'
from pathlib import Path
import sys

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

# V12 declared DETTERENT_SOUNDS (typo) but one render path used DETERRENT_SOUNDS.
# Normalize every reference to the existing declared constant.
s2 = s.replace("DETERRENT_SOUNDS", "DETTERENT_SOUNDS")

if s2 == s:
    print("No DETERRENT_SOUNDS references found. Checking declaration...")
    if "const DETTERENT_SOUNDS" not in s:
        raise SystemExit("ERROR: Neither DETTERENT_SOUNDS declaration nor DETERRENT_SOUNDS references were found.")
else:
    p.write_text(s2, encoding="utf-8")
    print("Fixed DETERRENT_SOUNDS -> DETTERENT_SOUNDS in App.jsx.")
PY

echo "SUCCESS: PigeonCop deterrent-sound variable fix installed."
echo "Backup: $BACKUP"
echo
echo "Run:"
echo "  npm run dev"
