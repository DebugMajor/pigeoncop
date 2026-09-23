PigeonCop Deployment UI V11
============================

Purpose
-------
This package completely replaces the monitoring dashboard presentation while preserving
the existing Camera / YOLO / Test Video / custom video / deterrent pipeline.

UI
--
- Green-only forest/mint dashboard.
- No left sidebar.
- Single desktop viewport.
- Large camera workspace.
- Compact controls directly below camera.
- Recent Detections on right.
- Compact Session Status on right.
- Detection Activity strip at bottom.
- AI engine status in the top bar.
- Responsive fallback for smaller screens.

Functionality preserved / connected
------------------------------------
- Live Camera
- Built-in Test Video
- Custom video upload
- Test Video play/pause
- Stop monitoring
- Reset Test
- Deterrent sound selection
- Test Sound play/stop
- Existing Camera detection callbacks
- Existing V3 / ONNX / WebGPU pipeline

Deployment
----------
This app uses a lightweight history API router. The package includes:
- vercel.json for Vercel SPA rewrites
- public/_redirects for Netlify SPA rewrites

Install
-------
Run from the PigeonCop project root:

  unzip ~/Downloads/pigeoncop-deployment-ui-v11.zip
  bash pigeoncop-deployment-ui-v11/install-deployment-ui-v11.sh

Validate:
  npm run build
  npm run preview

Dashboard:
  http://localhost:5173/monitor

Home:
  http://localhost:5173/

A backup is created before installation.
