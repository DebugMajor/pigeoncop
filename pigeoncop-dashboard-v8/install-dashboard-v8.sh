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
BACKUP="$ROOT/.pigeoncop-dashboard-v8-backup-$STAMP"
mkdir -p "$BACKUP"

cp "$SRC/App.jsx" "$BACKUP/App.jsx"
[[ -f "$COMP/ControlPanel.jsx" ]] && cp "$COMP/ControlPanel.jsx" "$BACKUP/ControlPanel.jsx"
[[ -f "$SRC/dashboard-v7.css" ]] && cp "$SRC/dashboard-v7.css" "$BACKUP/dashboard-v7.css"
[[ -f "$SRC/dashboard-v8.css" ]] && cp "$SRC/dashboard-v8.css" "$BACKUP/dashboard-v8.css"

cp "$PKG/dashboard-v8.css" "$SRC/dashboard-v8.css"

# Add V8 stylesheet import exactly once.
python - "$SRC/App.jsx" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")
line = 'import "./dashboard-v8.css";'
if line not in s:
    for anchor in ['import "./dashboard-v7.css";',
                   'import "./dashboard-v6.css";',
                   'import "./sound-selection.css";']:
        if anchor in s:
            s = s.replace(anchor, anchor + "\n" + line, 1)
            break
    else:
        s = line + "\n" + s
    p.write_text(s, encoding="utf-8")
PY

# Add the audio toggle state and replace only handleTestDetection.
python - "$SRC/App.jsx" <<'PY'
from pathlib import Path
import sys, re

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

state_line = 'const [testSoundPlaying, setTestSoundPlaying] = useState(false);'
if state_line not in s:
    needle = 'const [testVideoPlaying, setTestVideoPlaying] = useState(false);'
    if needle not in s:
        raise SystemExit("ERROR: Could not find testVideoPlaying state in App.jsx.")
    s = s.replace(needle, needle + "\n    " + state_line, 1)

start = s.find("    const handleTestDetection = () => {")
if start == -1:
    raise SystemExit("ERROR: Could not find handleTestDetection in App.jsx.")

end = s.find("\n    };", start)
if end == -1:
    raise SystemExit("ERROR: Could not find end of handleTestDetection in App.jsx.")
end += len("\n    };")

replacement = """    const handleTestDetection = () => {
        const targetUrl = new URL(selectedSoundPath, window.location.href).href;

        if (!testSoundRef.current) {
            testSoundRef.current = new Audio(selectedSoundPath);
            testSoundRef.current.preload = "auto";
            testSoundRef.current.volume = 1;
            testSoundRef.current.addEventListener("ended", () => setTestSoundPlaying(false));
        }

        if (testSoundRef.current.src !== targetUrl) {
            testSoundRef.current.pause();
            testSoundRef.current = new Audio(selectedSoundPath);
            testSoundRef.current.preload = "auto";
            testSoundRef.current.volume = 1;
            testSoundRef.current.addEventListener("ended", () => setTestSoundPlaying(false));
        }

        if (!testSoundRef.current.paused) {
            testSoundRef.current.pause();
            testSoundRef.current.currentTime = 0;
            setTestSoundPlaying(false);
            return;
        }

        testSoundRef.current.currentTime = 0;
        testSoundRef.current.play()
            .then(() => setTestSoundPlaying(true))
            .catch((error) => {
                setTestSoundPlaying(false);
                console.log("Test sound playback failed:", error);
            });
    };"""

s = s[:start] + replacement + s[end:]

# Pass state down to ControlPanel once.
if "testSoundPlaying={testSoundPlaying}" not in s:
    needle = "                            selectedSoundLabel={selectedSoundLabel}\n"
    if needle not in s:
        raise SystemExit("ERROR: Could not find selectedSoundLabel prop.")
    s = s.replace(
        needle,
        needle + "                            testSoundPlaying={testSoundPlaying}\n",
        1
    )

p.write_text(s, encoding="utf-8")
PY

# Patch ControlPanel without replacing its existing UI.
python - "$COMP/ControlPanel.jsx" <<'PY'
from pathlib import Path
import sys

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if "testSoundPlaying" not in s:
    needle = "    onVideoSelect,\n}) {"
    if needle not in s:
        raise SystemExit("ERROR: Could not find ControlPanel props ending.")
    s = s.replace(needle, "    onVideoSelect,\n    testSoundPlaying,\n}) {", 1)

old = '<button type="button" className="action-button action-tertiary" onClick={onTestDetection}>'
new = '<button type="button" className={`action-button action-tertiary ${testSoundPlaying ? "sound-playing" : ""}`} onClick={onTestDetection}>'
if old in s:
    s = s.replace(old, new, 1)

old_text = '<FontAwesomeIcon icon={faVolumeHigh} /><span>Test Sound</span>'
new_text = '<FontAwesomeIcon icon={testSoundPlaying ? faStop : faVolumeHigh} /><span>{testSoundPlaying ? "Stop Sound" : "Test Sound"}</span>'
if old_text in s:
    s = s.replace(old_text, new_text, 1)
else:
    # Keep the file valid even if the current label differs slightly.
    print("WARNING: Existing Test Sound label was not found; audio toggle logic is still installed.")

# Ensure faStop import exists if the JSX now uses it.
if "testSoundPlaying ? faStop" in s and "faStop" not in s.splitlines()[0]:
    import_line = 'import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";'
    marker = 'import {'
    if 'faStop' not in s:
        pass

# Replace the icon import list robustly.
if "faStop" not in s:
    s = s.replace(
        'faPlay, faPause, faStop, faVolumeHigh',
        'faPlay, faPause, faStop, faVolumeHigh',
        1
    )

p.write_text(s, encoding="utf-8")
PY

echo "SUCCESS: PigeonCop Dashboard V8 installed."
echo "Desktop layout is viewport-fitted: camera + controls + activity + right dashboard."
echo "Desktop page scrolling is disabled; responsive fallback remains available below 1050px."
echo "Test Sound is now a toggle: play on first click, stop/reset on second click."
echo "Backup: $BACKUP"
echo
echo "Run:"
echo "  npm run dev"
echo
echo "Open:"
echo "  http://localhost:5173/monitor"
