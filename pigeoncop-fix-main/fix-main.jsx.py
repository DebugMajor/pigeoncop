from pathlib import Path
from datetime import datetime
import shutil

ROOT = Path.cwd()
SRC = ROOT / "src"
MAIN = SRC / "main.jsx"
ROUTER = SRC / "components" / "PigeonCopRouter.jsx"

if not MAIN.exists():
    raise SystemExit("ERROR: Run this from the PigeonCop project root containing src/main.jsx.")
if not ROUTER.exists():
    raise SystemExit("ERROR: src/components/PigeonCopRouter.jsx was not found.")

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
backup = ROOT / f".main-fix-backup-{stamp}"
backup.mkdir()
shutil.copy2(MAIN, backup / "main.jsx")

MAIN.write_text("""import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PigeonCopRouter from "./components/PigeonCopRouter";
import "./index.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <PigeonCopRouter />
    </StrictMode>
);
""", encoding="utf-8")

print("SUCCESS: src/main.jsx repaired.")
print(f"Backup: {backup}")
print("Run: npm run dev")
