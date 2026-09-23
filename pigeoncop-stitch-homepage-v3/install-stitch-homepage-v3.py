from pathlib import Path
from datetime import datetime
import shutil
import re
import sys

ROOT = Path.cwd()
SRC = ROOT / "src"
MAIN = SRC / "main.jsx"
APP = SRC / "App.jsx"
COMP = SRC / "components"

if not MAIN.exists() or not APP.exists() or not COMP.exists():
    print("ERROR: Run this installer from the PigeonCop project root (folder containing src/main.jsx and src/App.jsx).")
    sys.exit(1)

SOURCE = Path(__file__).resolve().parent
for name in ("HomePage.jsx", "HomePage.css", "PigeonCopRouter.jsx"):
    if not (SOURCE / name).exists():
        print(f"ERROR: Missing {name} in the ZIP folder.")
        sys.exit(1)

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
backup = ROOT / f".stitch-home-v3-backup-{stamp}"
backup.mkdir()
shutil.copy2(MAIN, backup / "main.jsx")
shutil.copy2(APP, backup / "App.jsx")

app_text = APP.read_text(encoding="utf-8")

# Undo the previous Stitch installer only if its home-state was inserted.
if "pigeonCopView" in app_text:
    candidates = sorted(ROOT.glob(".stitch-home-backup-*/App.jsx"), key=lambda p: p.parent.name, reverse=True)
    restored = False
    for candidate in candidates:
        old = candidate.read_text(encoding="utf-8")
        if "pigeonCopView" not in old and "function App" in old:
            shutil.copy2(candidate, APP)
            print(f"RESTORED dashboard from previous backup: {candidate.parent.name}")
            restored = True
            break
    if not restored:
        print("WARNING: Previous Stitch home-state found, but no clean backup was found. Continuing without rewriting App.jsx.")

shutil.copy2(SOURCE / "HomePage.jsx", COMP / "HomePage.jsx")
shutil.copy2(SOURCE / "HomePage.css", COMP / "HomePage.css")
shutil.copy2(SOURCE / "PigeonCopRouter.jsx", COMP / "PigeonCopRouter.jsx")

main = MAIN.read_text(encoding="utf-8")
main = re.sub(r'import\s+PigeonCopRouter\s+from\s+["\']\./components/PigeonCopRouter["\'];?\s*\n?', '', main)
main = re.sub(r'import\s+App\s+from\s+["\']\./App["\'];?\s*\n?',
              'import PigeonCopRouter from "./components/PigeonCopRouter";\n',
              main, count=1)

if 'PigeonCopRouter from "./components/PigeonCopRouter"' not in main:
    imports = list(re.finditer(r'^import .*?;?\s*$', main, re.MULTILINE))
    if imports:
        pos = imports[-1].end()
        main = main[:pos] + '\nimport PigeonCopRouter from "./components/PigeonCopRouter";' + main[pos:]
    else:
        main = 'import PigeonCopRouter from "./components/PigeonCopRouter";\n' + main

main = re.sub(r'<App\s*/>', '<PigeonCopRouter />', main)
if '<PigeonCopRouter />' not in main:
    shutil.copy2(backup / "main.jsx", MAIN)
    print("ERROR: Could not find the root <App /> render in src/main.jsx.")
    sys.exit(1)
MAIN.write_text(main, encoding="utf-8")

APP_CSS = ROOT / "src" / "App.css"
css = APP_CSS.read_text(encoding="utf-8") if APP_CSS.exists() else ""
if ".pigeoncop-dashboard-nav" not in css:
    css += """

/* PigeonCop Home / Monitoring navigation */
.pigeoncop-dashboard-nav {
    position: relative;
    z-index: 50;
    width: min(1240px, calc(100% - 40px));
    margin: 0 auto;
    padding: 12px 0 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}
.pigeoncop-dashboard-nav button {
    border: 1px solid rgba(114, 239, 185, .28);
    background: rgba(4, 18, 13, .9);
    color: #aaffd8;
    padding: 8px 13px;
    font: 700 10px/1 inherit;
    letter-spacing: .12em;
    cursor: pointer;
    border-radius: 7px;
}
.pigeoncop-dashboard-nav button:hover {
    border-color: rgba(114, 239, 185, .65);
    transform: translateY(-1px);
}
.pigeoncop-dashboard-nav span {
    color: #708078;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .14em;
}
@media (max-width: 640px) {
    .pigeoncop-dashboard-nav { width: calc(100% - 24px); }
}
"""
    APP_CSS.write_text(css, encoding="utf-8")

print("SUCCESS: Separate PigeonCop homepage + monitoring route installed.")
print("HOME: /")
print("MONITOR: /monitor")
print("Flow: Homepage -> TEST NOW -> existing dashboard")
print("Dashboard -> HOME -> Homepage")
print(f"Backup: {backup}")
print("Run: npm run dev")
