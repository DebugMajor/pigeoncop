PigeonCop UI Redesign V13
==========================

This package is a presentation-only dashboard redesign.

Changes:
- Desktop page scrolling is enabled.
- Larger, more polished header and brand area.
- Main camera gets a stable 540px monitoring viewport.
- Controls are a distinct, usable control deck.
- Right column has Recent Detections and Session Status with readable sizing.
- Detection Activity is a compact horizontal event strip.
- Green-only PigeonCop visual language.
- Responsive layouts for tablet/mobile.

The package does NOT replace App.jsx or Camera.jsx.
It only adds dashboard-deployment-v13.css and imports it into App.jsx.

Install from PigeonCop project root:
  unzip ~/Downloads/pigeoncop-ui-redesign-v13.zip
  bash pigeoncop-ui-redesign-v13/install-ui-v13.sh
  npm run dev

Open:
  http://localhost:5173/monitor

A backup of the existing dashboard CSS imports is created.
