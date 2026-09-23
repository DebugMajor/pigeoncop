# PigeonCop

**Real-Time AI Bird Monitoring & Deterrence — running locally in the browser.**

PigeonCop is a React + Vite computer-vision application that turns a browser camera or a local test video into a bird-monitoring and deterrence console. The current product scope focuses on **Pigeon detection**, with a separate **Human face detector** used for presence awareness without triggering the bird deterrent.

## Product flow

```text
Home
  ↓
TEST NOW
  ↓
Monitoring
  ├── Live Camera
  └── Test Video
        ↓
Frame Sampling
        ↓
Motion Detection
        ↓
Pigeon YOLO V3
        ↓
Confidence Filter
        ↓
Temporal Confirmation
        ↓
Confirmed Bird Event
   ├── Bounding Box
   ├── Snapshot
   ├── Deterrent
   └── Detection Log
```

A parallel MediaPipe Face Detector path produces Human events and does **not** trigger the bird deterrent.

## Current capabilities

- Live browser-camera monitoring
- Built-in Test Video mode
- Local user-uploaded video in Test Video mode
- Motion-gated Pigeon inference
- Temporal confirmation and duplicate/re-arm logic
- Pigeon bounding boxes and confidence
- Human face detection as a separate event type
- Snapshot capture for confirmed events
- Selectable deterrent sounds with cooldown protection
- Test Sound controls with explicit stop/reset behavior
- Session telemetry and detection activity
- ONNX model execution with WebGPU when supported
- Home → Test Now → Monitoring navigation
- Vercel/Netlify SPA fallback configuration

## Model evidence

Current product model: **Pigeon V3 YOLO**

Held-out test results:

| Metric | V3 |
|---|---:|
| Precision | 92.6% |
| Recall | 87.6% |
| mAP50 | 94.5% |
| mAP50-95 | 68.5% |

Additional validation recorded in the project worklog includes a 90-image human-negative test set with no pigeon detections at confidence 0.25, plus browser loading verification of the exported ONNX model with WebGPU.

These numbers describe the evaluated test set; they are not a guarantee of production performance across all environments.

## Tech stack

- React 19
- Vite 8
- JavaScript
- Bootstrap 5
- Font Awesome
- Canvas API
- MediaPipe Tasks Vision
- Ultralytics YOLO runtime
- ONNX
- WebGPU
- Browser MediaDevices / camera APIs

## Local setup

```bash
npm install
npm run dev
```

For camera testing over HTTPS on a LAN, the project includes the Vite basic-SSL plugin. Production deployments should use platform-managed HTTPS.

## Production validation

Build:

```bash
npm run build
```

Verify packaged production assets:

```bash
npm run verify:production
```

Preview:

```bash
npm run preview
```

The production verification checks that the Vite build contains the expected HTML, ONNX model, test video and deterrent audio assets.

## Deployment

The repository contains:

- `vercel.json` for SPA rewrites on Vercel
- `public/_redirects` for SPA rewrites on Netlify

After deployment, verify:

1. `/` loads the landing page.
2. TEST NOW opens `/monitor`.
3. The ONNX model loads from the deployed origin.
4. Browser camera permission works under HTTPS.
5. Test Video and uploaded video work.
6. Deterrent audio and snapshots work on the deployed origin.

See [docs/deployment.md](docs/deployment.md).

## Architecture

See [docs/architecture.md](docs/architecture.md).

## Performance

Production performance numbers should be measured on the target hardware/browser rather than inferred from model benchmark metrics.

Use [docs/performance-benchmark.md](docs/performance-benchmark.md) to record motion-processing time, AI inference latency, effective processing FPS, end-to-end detection latency, fallback behavior and lower-end hardware observations.

## Current scope and limitations

The current product intentionally does **not** claim:

- multi-bird species support beyond Pigeon
- persistent historical storage
- MongoDB/Express backend
- cloud camera streaming
- guaranteed effectiveness of any deterrent sound
- universal WebGPU availability

Multi-bird detection, persistent history and a backend remain future options rather than requirements for the browser MVP.

## Project status

The functional browser MVP is in the product/deployment hardening stage:

- core camera + motion + AI path: implemented
- Pigeon V3 + ONNX/WebGPU: implemented
- Human detection path: implemented
- deterrent + cooldown: implemented
- Test Video + local upload: implemented
- homepage + monitoring flow: implemented
- deployment packaging: prepared
- production verification/testing: remaining
- portfolio evidence/documentation: remaining
