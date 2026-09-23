from pathlib import Path
from datetime import datetime
import shutil, re

ROOT = Path.cwd()
SRC = ROOT / "src"
COMP = SRC / "components"

if not (SRC / "App.jsx").exists():
    raise SystemExit("ERROR: Run this installer from the PigeonCop project root (folder containing src/App.jsx).")

STAMP = datetime.now().strftime("%Y%m%d-%H%M%S")
BACKUP = ROOT / f".pigeoncop-ui-backup-{STAMP}"
BACKUP.mkdir()

def backup(p):
    if p.exists():
        t = BACKUP / p.relative_to(ROOT)
        t.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, t)

for p in [SRC/"main.jsx", COMP/"PigeonCopRouter.jsx", COMP/"HomePage.jsx", COMP/"HomePage.css"]:
    backup(p)

PKG = Path(__file__).parent
COMP.mkdir(parents=True, exist_ok=True)
shutil.copy2(PKG/"HomePage.jsx", COMP/"HomePage.jsx")
shutil.copy2(PKG/"HomePage.css", COMP/"HomePage.css")
shutil.copy2(PKG/"PigeonCopRouter.jsx", COMP/"PigeonCopRouter.jsx")

main = SRC / "main.jsx"
text = main.read_text(encoding="utf-8")
text = re.sub(r'import\s+[^;]+from\s+["\']\.\/App["\'];?\s*', '', text)
text = re.sub(r'import\s+[^;]+from\s+["\']\.\/components\/PigeonCopRouter["\'];?\s*', '', text)
text = 'import PigeonCopRouter from "./components/PigeonCopRouter";\n' + text.lstrip()

# Replace the rendered App component while preserving StrictMode if present.
text = re.sub(r'<StrictMode>\s*App\s*</StrictMode>', '<StrictMode><PigeonCopRouter /></StrictMode>', text)
text = re.sub(r'(?<![A-Za-z])App(?![A-Za-z])', 'PigeonCopRouter', text) if 'PigeonCopRouter />' not in text else text

# Repair accidental duplicate import if any.
lines = text.splitlines()
seen = False
clean = []
for line in lines:
    if line.strip() == 'import PigeonCopRouter from "./components/PigeonCopRouter";':
        if seen: continue
        seen = True
    clean.append(line)
text = "\n".join(clean) + "\n"

# If standard Vite render still references App, replace the render argument.
text = re.sub(r'\.render\(\s*PigeonCopRouter\s*\)', '.render(<PigeonCopRouter />)', text)
text = re.sub(r'\.render\(\s*<PigeonCopRouter\s*>\s*</PigeonCopRouter>\s*\)', '.render(<PigeonCopRouter />)', text)

main.write_text(text, encoding="utf-8")

print("SUCCESS: PigeonCop homepage UI installed.")
print("Home: http://localhost:5173/")
print("Dashboard: http://localhost:5173/monitor")
print(f"Backup: {BACKUP}")
print("Run: npm run dev")
