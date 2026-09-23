PigeonCop Phase 2 — Choose/Change Test Video

WHAT THIS DOES
- Adds Choose Video / Change Video to Test Video mode.
- Shows the selected filename.
- Uses the existing testVideoFile state already added to App.jsx.
- Keeps the existing deterrent sound selector and monitoring controls.
- Does not change Camera.jsx; your current uploaded-video Camera implementation remains intact.
- Selected videos stay local in the browser. No upload/backend is used.

INSTALL
1. Extract this ZIP into your PigeonCop project root (the folder containing src/).
2. Open PowerShell in that project root.
3. Run:
   python install-phase2-upload-ui.py
4. Start the app:
   npm run dev

The installer creates .phase2-backup files for App.jsx, ControlPanel.jsx and App.css before changing them.
