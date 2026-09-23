PigeonCop Dashboard Deployment V12
=================================

This is a complete dashboard shell redesign based on the latest screenshots.

Important:
- App.jsx is replaced with a self-contained dashboard UI.
- Existing src/components/Camera.jsx is still used.
- Existing detection callbacks, Test Video, custom video upload, deterrent sound selection,
  snapshot events and the current sound-stop behavior are preserved through Camera props.
- The old Header and ControlPanel presentation is not used by the new dashboard, avoiding
  inherited CSS/layout conflicts.
- Home remains / and monitoring remains /monitor through the existing router.
- Desktop page scrolling is disabled; responsive fallback restores normal scrolling.

Install from the PigeonCop project root:
  unzip ~/Downloads/pigeoncop-dashboard-deployment-v12.zip
  bash pigeoncop-dashboard-deployment-v12/install-dashboard-v12.sh

Validate:
  npm run build

Run:
  npm run dev

Dashboard:
  http://localhost:5173/monitor

Home:
  http://localhost:5173/
