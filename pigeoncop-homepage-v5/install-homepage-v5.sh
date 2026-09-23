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
BACKUP="$ROOT/.pigeoncop-home-v5-backup-$STAMP"
mkdir -p "$BACKUP"

backup_if_exists() {
  local file="$1"
  if [[ -f "$file" ]]; then
    mkdir -p "$BACKUP/$(dirname "${file#$ROOT/}")"
    cp "$file" "$BACKUP/${file#$ROOT/}"
  fi
}

mkdir -p "$COMP"
backup_if_exists "$COMP/HomePage.jsx"
backup_if_exists "$COMP/HomePage.css"

cp "$PKG/HomePage.jsx" "$COMP/HomePage.jsx"
cp "$PKG/HomePage.css" "$COMP/HomePage.css"

if [[ ! -f "$COMP/PigeonCopRouter.jsx" ]]; then
  echo "ERROR: src/components/PigeonCopRouter.jsx was not found."
  echo "Install the homepage/router package first."
  exit 1
fi

echo "SUCCESS: PigeonCop Homepage V5 installed."
echo "Logo overlap fixed: the combined wordmark is used by itself."
echo "Landing page: http://localhost:5173/"
echo "Monitoring dashboard: http://localhost:5173/monitor"
echo "TEST NOW -> /monitor"
echo "Backup: $BACKUP"
echo
echo "Run: npm run dev"
