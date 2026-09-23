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

if [[ ! -f "$COMP/HomePage.jsx" || ! -f "$COMP/HomePage.css" || ! -f "$COMP/PigeonCopRouter.jsx" ]]; then
  echo "ERROR: Expected homepage/router files were not found under src/components."
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.pigeoncop-home-fix-v6-backup-$STAMP"
mkdir -p "$BACKUP"

cp "$COMP/HomePage.jsx" "$BACKUP/HomePage.jsx"
cp "$COMP/HomePage.css" "$BACKUP/HomePage.css"
cp "$COMP/PigeonCopRouter.jsx" "$BACKUP/PigeonCopRouter.jsx"

cp "$PKG/HomePage.jsx" "$COMP/HomePage.jsx"
cp "$PKG/HomePage.css" "$COMP/HomePage.css"
cp "$PKG/PigeonCopRouter.jsx" "$COMP/PigeonCopRouter.jsx"

echo "SUCCESS: PigeonCop homepage/dashboard navigation fixed."
echo "Test Now: visible on landing page."
echo "Dashboard HOME button: removed."
echo "Dashboard logo: clickable -> /"
echo "Backup: $BACKUP"
echo "Run: npm run dev"
