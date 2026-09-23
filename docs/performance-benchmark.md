# PigeonCop Performance Benchmark

Record numbers from the real browser/device. Do not infer production performance from model training metrics.

## Environment

| Field | Value |
|---|---|
| Device | |
| CPU | |
| GPU | |
| RAM | |
| OS | |
| Browser | |
| Browser version | |
| WebGPU | |
| Input resolution | |
| Mode | Live / Test Video |

## Measurements

| Metric | Measured |
|---|---:|
| Motion processing (ms) | |
| Pigeon inference latency (ms) | |
| Human detector latency (ms) | |
| Effective AI FPS | |
| Motion → confirmed event (ms) | |
| Average confidence | |
| Approx. memory use | |

## Scenarios

### Static scene
Expected:
- minimal motion events
- Pigeon inference mostly skipped

### Single pigeon
Expected:
- motion gate activates
- Pigeon model runs
- temporal confirmation produces one event
- deterrent respects cooldown

### Human only
Expected:
- Human event may appear
- no bird event
- no bird deterrent

### Repeated pigeon
Expected:
- duplicate suppression remains controlled
- departure/re-arm permits a future event

### Test Video
Expected:
- same detection pipeline as Live Camera
- pause/reset work
- deterrent stops when the video is paused or reset

## Optimization backlog

- downscale motion canvas
- use `willReadFrequently` where appropriate
- pixel sampling
- reduce temporary allocations
- tune sampling/inference interval
- reduce unnecessary React renders
- benchmark CPU/WASM fallback
- test a lower-end device
