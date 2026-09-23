from pathlib import Path
from datetime import datetime
import shutil
import re
import sys

ROOT = Path.cwd()
APP = ROOT / "src" / "App.jsx"
COMP_DIR = ROOT / "src" / "components"
HOME = COMP_DIR / "HomePage.jsx"
CSS = COMP_DIR / "HomePage.css"
APP_CSS = ROOT / "src" / "App.css"

if not APP.exists() or not COMP_DIR.exists():
    print("ERROR: Run this installer from the PigeonCop project root (the folder containing src/App.jsx).")
    sys.exit(1)

SOURCE_DIR = Path(__file__).resolve().parent
source_home = SOURCE_DIR / "HomePage.jsx"
source_css = SOURCE_DIR / "HomePage.css"

# Also support the case where the previous ZIP was extracted directly into the project root.
if not source_home.exists():
    source_home = ROOT / "HomePage.jsx"
if not source_css.exists():
    source_css = ROOT / "HomePage.css"

if not source_home.exists() or not source_css.exists():
    print("ERROR: HomePage.jsx/HomePage.css were not found beside the installer or in the project root.")
    sys.exit(1)

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
backup_dir = ROOT / f".stitch-home-backup-{stamp}"
backup_dir.mkdir()
shutil.copy2(APP, backup_dir / "App.jsx")
if APP_CSS.exists():
    shutil.copy2(APP_CSS, backup_dir / "App.css")
if HOME.exists():
    shutil.copy2(HOME, backup_dir / "HomePage.jsx")
if CSS.exists():
    shutil.copy2(CSS, backup_dir / "HomePage.css")

app = APP.read_text(encoding="utf-8")

# 1. Ensure the homepage component exists.
shutil.copy2(source_home, HOME)
shutil.copy2(source_css, CSS)

# 2. Ensure import exists without duplicating it.
if not re.search(r'import\s+HomePage\s+from\s+["\']\./components/HomePage["\']', app):
    import_matches = list(re.finditer(r'^import .*?;?\s*$', app, re.MULTILINE))
    if import_matches:
        insert_at = import_matches[-1].end()
        app = app[:insert_at] + '\nimport HomePage from "./components/HomePage";' + app[insert_at:]
    else:
        app = 'import HomePage from "./components/HomePage";\n' + app

# 3. Add a view state if missing. Reuse existing useState import.
if 'pigeonCopView' not in app:
    fn = re.search(r'function\s+App\s*\([^)]*\)\s*\{', app)
    if not fn:
        print("ERROR: Could not locate function App() in src/App.jsx. No changes were written.")
        shutil.rmtree(backup_dir)
        sys.exit(1)
    state = '\n    const [pigeonCopView, setPigeonCopView] = useState("home");\n'
    app = app[:fn.end()] + state + app[fn.end():]

# 4. Put the homepage before the existing dashboard return.
if 'pigeonCopView === "home"' not in app:
    ret = re.search(r'\n\s*return\s*\(', app)
    if not ret:
        print("ERROR: Could not locate App.jsx return block. No changes were written.")
        shutil.rmtree(backup_dir)
        sys.exit(1)
    guard = '''\n    if (pigeonCopView === "home") {\n        return <HomePage onTestNow={() => setPigeonCopView("monitor")} />;\n    }\n'''
    app = app[:ret.start()] + guard + app[ret.start():]

# 5. Add dashboard HOME navigation exactly once, immediately before Header.
if 'className="pigeoncop-dashboard-nav"' not in app:
    header = re.search(r'<Header\s*/>', app)
    if header:
        nav = '''<div className="pigeoncop-dashboard-nav">\n                <button type="button" onClick={() => setPigeonCopView("home")}>← HOME</button>\n                <span>MONITORING CONSOLE</span>\n            </div>\n            '''
        app = app[:header.start()] + nav + app[header.start():]
    else:
        print("WARNING: <Header /> was not found. Homepage works, but dashboard HOME navigation was not added.")

APP.write_text(app, encoding="utf-8")

# 6. Add minimal dashboard navigation styling without replacing existing App.css.
css = APP_CSS.read_text(encoding="utf-8") if APP_CSS.exists() else ""
if ".pigeoncop-dashboard-nav" not in css:
    css += '''\n\n/* PigeonCop homepage/dashboard navigation */\n.pigeoncop-dashboard-nav {\n    max-width: 1240px;\n    margin: 0 auto;\n    padding: 12px 20px 4px;\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 16px;\n}\n.pigeoncop-dashboard-nav button {\n    border: 1px solid rgba(114, 239, 185, .25);\n    background: rgba(255, 255, 255, .02);\n    color: #aaffd8;\n    padding: 8px 12px;\n    font: 700 10px/1 inherit;\n    letter-spacing: .1em;\n    cursor: pointer;\n    border-radius: 6px;\n}\n.pigeoncop-dashboard-nav button:hover {\n    border-color: rgba(114, 239, 185, .55);\n}\n.pigeoncop-dashboard-nav span {\n    color: #708078;\n    font-size: 9px;\n    font-weight: 600;\n    letter-spacing: .13em;\n}\n@media (max-width: 640px) {\n    .pigeoncop-dashboard-nav { padding-left: 12px; padding-right: 12px; }\n}\n'''
    APP_CSS.write_text(css, encoding="utf-8")

print("SUCCESS: PigeonCop Stitch homepage integration installed.")
print(f"Backup: {backup_dir}")
print("Flow: Home → TEST NOW → existing Monitoring Dashboard")
print("Dashboard: HOME button returns to landing page")
print("Run: npm run dev")
