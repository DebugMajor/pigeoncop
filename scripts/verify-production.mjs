import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const required = [
  "dist/index.html",
  "dist/models/pigeon-v3.onnx",
  "dist/videos/pigeon-test.mp4",
  "dist/sounds/motion-feedback-soothing-rock.wav",
  "dist/sounds/deterrent-loud-alert.wav",
  "dist/sounds/deterrent-high-frequency.wav",
  "dist/sounds/deterrent-high-frequency-pulse.wav",
  "dist/sounds/deterrent-gunshot.wav",
  "dist/logo-wordmark.png",
  "dist/logo-mark.png"
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));

if (missing.length) {
  console.error("Production asset verification failed.");
  for (const file of missing) {
    console.error("- " + file);
  }
  process.exit(1);
}

console.log("Production asset verification passed.");
for (const file of required) {
  const size = fs.statSync(path.join(root, file)).size;
  console.log(`${file} — ${size} bytes`);
}
