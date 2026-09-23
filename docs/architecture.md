# PigeonCop Architecture

## High-level flow

```text
                 ┌─────────────────────┐
                 │   Live Camera       │
                 │   Test Video        │
                 │   User Video File   │
                 └──────────┬──────────┘
                            │
                            ▼
                    Frame Sampling
                            │
                            ▼
                    Motion Detection
                      /          \
                   NO              YES
                   │                │
                   ▼                ▼
             Skip Pigeon AI      YOLO V3
                                    │
                                    ▼
                              Confidence Filter
                                    │
                                    ▼
                            Temporal Confirmation
                                    │
                                    ▼
                              Bird Event
                         ┌──────┬──────┬──────┐
                         │      │      │      │
                         ▼      ▼      ▼      ▼
                        BBox Snapshot Deterrent Log

Parallel path:
Camera / Test Video
        │
        ▼
MediaPipe Face Detector
        │
        ▼
Human Event
(no bird deterrent)
```

## Component responsibilities

### PigeonCopRouter
Owns the two product surfaces:

- `/` → landing page
- `/monitor` → monitoring dashboard

### Camera
Owns camera/video lifecycle and frame processing:

- `getUserMedia()`
- Test Video setup
- Uploaded-video object URLs
- Canvas frame capture
- motion calculation
- start/stop cleanup
- bounding-box rendering
- deterrent audio lifecycle

### AIModel
Owns browser inference:

- Pigeon YOLO V3 loading
- MediaPipe Face Detector loading
- confidence filtering
- temporal confirmation
- inference overlap prevention
- confirmed event emission

## Event model

The current event vocabulary is:

```js
{
  id,
  type: "bird" | "human",
  timestamp,
  confidence,
  name,
  x1,
  y1,
  x2,
  y2,
  snapshot,
  capturedAt,
  deterrentStatus
}
```

The model can later be extended with explicit `eventType`, `motionPercentage`, `deterrentTriggered`, `reason` and performance metadata.

## Engineering choices

Motion gating reduces unnecessary Pigeon inference. The `isProcessing` ref prevents overlapping inferences. Temporal confirmation and re-arm logic reduce noisy duplicate events.

The Pigeon detector is the perception layer. MediaPipe supplies a parallel Human signal. An external LLM is intentionally not part of the primary real-time path.

## Deployment model

The current MVP is frontend-only:

```text
Browser
  ├── React UI
  ├── Camera / video
  ├── Canvas processing
  ├── MediaPipe
  ├── YOLO / ONNX
  └── WebGPU
```

No server is required for the core monitoring loop.
