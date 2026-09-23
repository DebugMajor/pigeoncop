PigeonCop Deterrent Sound Variable Fix V12.2

The V12 dashboard had a variable-name typo:
- declared: DETTERENT_SOUNDS
- referenced: DETERRENT_SOUNDS

This patch normalizes the references in src/App.jsx.

It does not replace the dashboard, Camera.jsx, audio files, or detection logic.

Install from PigeonCop root:
  unzip ~/Downloads/pigeoncop-deterrent-sounds-fix-v12_2.zip
  bash pigeoncop-deterrent-sounds-fix-v12_2/install-deterrent-sounds-fix-v12_2.sh

Then:
  npm run dev
