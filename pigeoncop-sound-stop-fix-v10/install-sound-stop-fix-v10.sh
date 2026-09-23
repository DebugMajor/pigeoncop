#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
CAM="$ROOT/src/components/Camera.jsx"
PKG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -f "$CAM" ]]; then
  echo "ERROR: Run this from the PigeonCop project root."
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.pigeoncop-sound-stop-fix-v10-backup-$STAMP"
mkdir -p "$BACKUP"
cp "$CAM" "$BACKUP/Camera.jsx"

python - "$CAM" <<'PY'
from pathlib import Path
import sys

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "function stopDeterrentSound()" not in s:
    needle = "    function handleBirdPresence() {"
    if needle not in s:
        raise SystemExit("ERROR: handleBirdPresence was not found in Camera.jsx.")
    helper = '''    function stopDeterrentSound() {
        if (deterrentSoundRef.current) {
            deterrentSoundRef.current.pause();
            deterrentSoundRef.current.currentTime = 0;
        }
    }

'''
    s = s.replace(needle, helper + needle, 1)

old = 'if (playbackAction === "play") videoRef.current.play().catch(console.log); else videoRef.current.pause();'
new = '''if (playbackAction === "play") {
            videoRef.current.play().catch(console.log);
        } else {
            videoRef.current.pause();
            stopDeterrentSound();
        }'''
if old in s:
    s = s.replace(old, new, 1)

reset_line = 'videoRef.current.currentTime = 0; prevFrameRef.current = null; consecutiveMotionFrames.current = 0;'
if reset_line in s:
    pos = s.find(reset_line)
    nearby = s[pos:pos + 240]
    if "stopDeterrentSound();" not in nearby:
        s = s.replace(
            reset_line,
            'stopDeterrentSound(); videoRef.current.currentTime = 0; prevFrameRef.current = null; consecutiveMotionFrames.current = 0;',
            1
        )

needle = 'function stopCamera() {'
if needle not in s:
    raise SystemExit("ERROR: stopCamera was not found in Camera.jsx.")
if 'function stopCamera() {\n        stopDeterrentSound();' not in s:
    s = s.replace(needle, 'function stopCamera() {\n        stopDeterrentSound();', 1)

old_effect = '''    useEffect(() => {
        if (!deterrentSoundPath) return;
        if (deterrentSoundRef.current) deterrentSoundRef.current.pause();
        const audio = new Audio(deterrentSoundPath);'''
new_effect = '''    useEffect(() => {
        if (!deterrentSoundPath) return;

        if (deterrentSoundRef.current) {
            deterrentSoundRef.current.pause();
            deterrentSoundRef.current.currentTime = 0;
        }

        const audio = new Audio(deterrentSoundPath);'''
if old_effect in s:
    s = s.replace(old_effect, new_effect, 1)

p.write_text(s, encoding="utf-8")
PY

echo "SUCCESS: PigeonCop sound-stop fix V10 installed."
echo "Deterrent audio stops/resets on pause, reset, stop, and sound replacement."
echo "Backup: $BACKUP"
echo "Run: npm run dev"
