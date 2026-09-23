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

if [[ ! -f "$COMP/ControlPanel.jsx" ]]; then
  echo "ERROR: src/components/ControlPanel.jsx was not found."
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.pigeoncop-dashboard-v9-backup-$STAMP"
mkdir -p "$BACKUP"

cp "$SRC/App.jsx" "$BACKUP/App.jsx"
cp "$COMP/ControlPanel.jsx" "$BACKUP/ControlPanel.jsx"
[[ -f "$SRC/dashboard-v8.css" ]] && cp "$SRC/dashboard-v8.css" "$BACKUP/dashboard-v8.css"
[[ -f "$SRC/dashboard-v9.css" ]] && cp "$SRC/dashboard-v9.css" "$BACKUP/dashboard-v9.css"

cp "$PKG/dashboard-v9.css" "$SRC/dashboard-v9.css"

# Add stylesheet import once.
python - "$SRC/App.jsx" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")
line = 'import "./dashboard-v9.css";'
if line not in s:
    anchors = [
        'import "./dashboard-v8.css";',
        'import "./dashboard-v7.css";',
        'import "./dashboard-v6.css";',
        'import "./sound-selection.css";',
    ]
    for anchor in anchors:
        if anchor in s:
            s = s.replace(anchor, anchor + "\n" + line, 1)
            break
    else:
        s = line + "\n" + s
    p.write_text(s, encoding="utf-8")
PY

# Add testSoundPlaying state.
python - "$SRC/App.jsx" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")
state = 'const [testSoundPlaying, setTestSoundPlaying] = useState(false);'
if state not in s:
    needle = 'const [testVideoPlaying, setTestVideoPlaying] = useState(false);'
    if needle not in s:
        raise SystemExit("ERROR: testVideoPlaying state was not found.")
    s = s.replace(needle, needle + "\n    " + state, 1)
p.write_text(s, encoding="utf-8")
PY

# Replace handleTestDetection robustly by slicing between its known signature and closing "};".
python - "$SRC/App.jsx" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

start = s.find('const handleTestDetection = () => {')
if start == -1:
    raise SystemExit("ERROR: handleTestDetection was not found.")

brace = s.find('{', start)
depth = 0
end = None
for i in range(brace, len(s)):
    if s[i] == '{':
        depth += 1
    elif s[i] == '}':
        depth -= 1
        if depth == 0:
            end = i + 1
            # include a trailing semicolon if present
            if end < len(s) and s[end] == ';':
                end += 1
            break

if end is None:
    raise SystemExit("ERROR: Could not locate handleTestDetection end.")

replacement = """const handleTestDetection = () => {
        const targetUrl = new URL(selectedSoundPath, window.location.href).href;

        if (!testSoundRef.current || testSoundRef.current.src !== targetUrl) {
            if (testSoundRef.current) {
                testSoundRef.current.pause();
                testSoundRef.current.currentTime = 0;
            }

            testSoundRef.current = new Audio(selectedSoundPath);
            testSoundRef.current.preload = "auto";
            testSoundRef.current.volume = 1;
            testSoundRef.current.addEventListener("ended", () => {
                setTestSoundPlaying(false);
            });
        }

        if (!testSoundRef.current.paused) {
            stopTestSound();
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

# Add helper before handleDetection.
helper = """const stopTestSound = () => {
        if (testSoundRef.current) {
            testSoundRef.current.pause();
            testSoundRef.current.currentTime = 0;
        }
        setTestSoundPlaying(false);
    };

    """
if "const stopTestSound = () =>" not in s:
    needle = "const handleDetection = (detection) => {"
    if needle not in s:
        raise SystemExit("ERROR: handleDetection was not found.")
    s = s.replace(needle, helper + needle, 1)

# Make stopTestSound run before the stop/reset/pause actions.
old = 'const handleResetTest = () => {\n        setDetections([]);'
if old in s:
    s = s.replace(old, 'const handleResetTest = () => {\n        stopTestSound();\n        setDetections([]);', 1)

old = 'const handleTogglePlayback = () => {\n        const next = !testVideoPlaying;'
if old in s:
    s = s.replace(old, 'const handleTogglePlayback = () => {\n        const next = !testVideoPlaying;\n        if (!next) stopTestSound();', 1)

# Stop on status leaving active.
old = 'if (status !== "active") {\n            sessionStartedRef.current = null;'
if old in s:
    s = s.replace(old, 'if (status !== "active") {\n            stopTestSound();\n            sessionStartedRef.current = null;', 1)

# Pass state to ControlPanel.
if 'testSoundPlaying={testSoundPlaying}' not in s:
    needle = 'selectedSoundLabel={selectedSoundLabel}'
    if needle not in s:
        raise SystemExit("ERROR: selectedSoundLabel prop was not found.")
    s = s.replace(needle, needle + '\n                            testSoundPlaying={testSoundPlaying}', 1)

p.write_text(s, encoding="utf-8")
PY

# Patch ControlPanel button and prop.
python - "$COMP/ControlPanel.jsx" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

if 'testSoundPlaying,' not in s:
    needle = '    onVideoSelect,\n}) {'
    if needle not in s:
        raise SystemExit("ERROR: ControlPanel props ending not found.")
    s = s.replace(needle, '    onVideoSelect,\n    testSoundPlaying,\n}) {', 1)

old = '<button type="button" className="action-button action-tertiary" onClick={onTestDetection}>'
new = '<button type="button" className={`action-button action-tertiary ${testSoundPlaying ? "sound-playing" : ""}`} onClick={onTestDetection}>'
if old in s:
    s = s.replace(old, new, 1)

old_label = '<FontAwesomeIcon icon={faVolumeHigh} /><span>Test Sound</span>'
new_label = '<FontAwesomeIcon icon={testSoundPlaying ? faStop : faVolumeHigh} /><span>{testSoundPlaying ? "Stop Sound" : "Test Sound"}</span>'
if old_label in s:
    s = s.replace(old_label, new_label, 1)
else:
    print("WARNING: Could not find the existing Test Sound JSX label. The handler is still fixed.")
p.write_text(s, encoding="utf-8")
PY

echo "SUCCESS: PigeonCop Dashboard V9 installed."
echo "Desktop layout is fitted to the viewport."
echo "Test Sound now stops on: second click, video pause, reset, and monitoring stop."
echo "Backup: $BACKUP"
echo
echo "Run: npm run dev"
