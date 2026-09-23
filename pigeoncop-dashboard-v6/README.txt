PigeonCop Dashboard V6
=======================

This version addresses the supplied latest dashboard screenshots.

UI:
- No left sidebar.
- No redundant large Current Run / statistics wall.
- Camera viewport is shorter.
- Compact controls sit immediately below the camera.
- Right side contains only Recent Detections + compact Session Status.
- AI engine status is shown in the top monitoring status row and a small right-side status line.
- Green-only forest/mint theme.
- Activity remains below the main monitoring zone.

Audio:
- Longer/stronger synthetic Soothing Rock
- Longer/stronger synthetic Loud Alert
- Longer/stronger synthetic High Frequency
- New High Frequency Pulse
- New synthetic Gunshot SFX
- Test volume is set to 100%

Important:
The synthetic sound files are not measurements of avian deterrence effectiveness.
Do not assume a sound is effective solely because it is louder or higher-frequency.

Install from PigeonCop root:
  unzip ~/Downloads/pigeoncop-dashboard-v6.zip
  bash pigeoncop-dashboard-v6/install-dashboard-v6.sh
  npm run dev

Open:
  http://localhost:5173/monitor
