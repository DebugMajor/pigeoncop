from pathlib import Path
from shutil import copy2
import re

ROOT = Path.cwd()
APP = ROOT / "src" / "App.jsx"
CONTROL = ROOT / "src" / "components" / "ControlPanel.jsx"
CSS = ROOT / "src" / "App.css"
SOURCE_CONTROL = Path(__file__).with_name("ControlPanel.phase2.jsx")
SOURCE_CSS = Path(__file__).with_name("phase2_upload_ui.css")

if not APP.exists() or not CONTROL.exists() or not CSS.exists():
    raise SystemExit("Run this installer from the PigeonCop project root (the folder containing src/App.jsx).")

# Safety backups.
for path in (APP, CONTROL, CSS):
    backup = path.with_suffix(path.suffix + ".phase2-backup")
    if not backup.exists():
        copy2(path, backup)

# Replace only ControlPanel.jsx. This keeps the existing sound-selection behavior and UI intact.
CONTROL.write_text(SOURCE_CONTROL.read_text(encoding="utf-8"), encoding="utf-8")

# Add the callback prop to the existing ControlPanel invocation if it is not already there.
app = APP.read_text(encoding="utf-8")
if "testVideoFile={testVideoFile}" not in app:
    raise SystemExit("App.jsx does not contain testVideoFile={testVideoFile}. The Phase 2 Camera/App step has not been completed.")

if "onVideoSelect={setTestVideoFile}" not in app:
    marker = "testVideoFile={testVideoFile}"
    app = app.replace(marker, marker + "\n                            onVideoSelect={setTestVideoFile}", 1)
    APP.write_text(app, encoding="utf-8")

# Append CSS once.
css = CSS.read_text(encoding="utf-8")
addition = SOURCE_CSS.read_text(encoding="utf-8").strip()
if "/* PigeonCop Phase 2 — local test-video picker */" not in css:
    CSS.write_text(css.rstrip() + "\n\n" + addition + "\n", encoding="utf-8")

print("Phase 2 video picker installed successfully.")
print("- ControlPanel.jsx updated with Choose Video / Change Video")
print("- App.jsx connected to setTestVideoFile")
print("- App.css updated with compact picker styling")
print("Backups created with .phase2-backup suffix.")
