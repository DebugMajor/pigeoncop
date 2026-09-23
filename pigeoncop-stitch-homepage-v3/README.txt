PigeonCop Stitch Homepage v3

This version creates a genuinely separate landing page.

Routes:
  /        = PigeonCop landing page
  /monitor = existing monitoring dashboard

TEST NOW on the landing page opens /monitor.
HOME on the dashboard returns to /.

The installer does not replace Camera, ControlPanel, YOLO, Test Video, sound, or detection logic.
If the previous Stitch installer inserted pigeonCopView state, this installer restores the clean App.jsx backup created by that installer.

Run from the PigeonCop project root:
  python pigeoncop-stitch-homepage-v3/install-stitch-homepage-v3.py
  npm run dev
