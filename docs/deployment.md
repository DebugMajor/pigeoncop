# PigeonCop Deployment Guide

## Build

From the repository root:

```bash
npm install
npm run lint
npm run build
npm run verify:production
```

Preview:

```bash
npm run preview
```

## Required production assets

The build must contain:

- `models/pigeon-v3.onnx`
- `videos/pigeon-test.mp4`
- `sounds/motion-feedback-soothing-rock.wav`
- `sounds/deterrent-loud-alert.wav`
- `sounds/deterrent-high-frequency.wav`
- `sounds/deterrent-high-frequency-pulse.wav`
- `sounds/deterrent-gunshot.wav`
- `logo-wordmark.png`
- `logo-mark.png`

## SPA routes

PigeonCop uses:

- `/`
- `/monitor`

The repository includes:

- `vercel.json`
- `public/_redirects`

so direct navigation to `/monitor` can be rewritten to the SPA entry point on supported hosts.

## Production smoke test

After deployment:

```text
[ ] /
[ ] TEST NOW -> /monitor
[ ] HTTPS
[ ] Live Camera permission
[ ] Denied-camera error state
[ ] Start / Stop
[ ] Test Video
[ ] Upload a local video
[ ] Pause / Play / Reset
[ ] Pigeon detection
[ ] Human detection
[ ] Snapshot
[ ] Deterrent audio
[ ] Test Sound
[ ] Audio stops on pause/reset/stop
[ ] ONNX model load
[ ] WebGPU inference
[ ] No blocking console errors
```

## Platform settings

### Vercel

```text
Build command: npm run build
Output directory: dist
```

The included `vercel.json` handles SPA rewrites.

### Netlify

```text
Build command: npm run build
Publish directory: dist
```

The included `public/_redirects` is copied into the build.

## Browser permissions

Production camera access should be tested from the HTTPS deployment origin. Audio should be started from a user gesture where required by browser autoplay policy.
