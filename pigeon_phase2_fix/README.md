# PigeonCop Phase 2 — User Video Upload

Adds a Test Video selector that lets the user choose a local video file. The selected file is used as the Test Video source and processed through the existing browser-side detection pipeline.

## Install

From the PigeonCop project root in Git Bash:

```bash
unzip -o "C:/Users/shash/Downloads/pigeoncop-phase2-video-upload-fixed.zip"
bash install-phase2-video.sh
npm run dev
```

The file picker appears after selecting **Test Video** under **TEST VIDEO → Choose Video**.

The video stays local to the browser; no backend upload is performed.
