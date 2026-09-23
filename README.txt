PigeonCop — Deterrent Sound Selection Feature

This feature pack adds:
- Soothing Rock (existing sound; keep motion-feedback-soothing-rock.wav in public/sounds/)
- Loud Alert (synthetic non-speech alert)
- High Frequency (synthetic audible high-frequency alert)
- A themed dropdown in Monitoring Controls
- Test Sound uses the currently selected sound
- Automatic bird deterrence uses the currently selected sound
- Existing 30-second deterrent cooldown remains unchanged

INSTALL
1. Unzip this package into the PigeonCop project root.
2. Append App.css.append to src/App.css (or copy its 10 lines into App.css).
3. Keep your existing public/sounds/motion-feedback-soothing-rock.wav file.
4. Run npm run dev and test all three sounds.

NEXT PHASE
The upload-your-own-video assessment mode should be implemented separately after this sound-selection feature is verified. The intended flow is: Test Video -> Built-in Demo / Upload Video -> video preview -> same motion/AI/detection pipeline -> metrics and event log.
