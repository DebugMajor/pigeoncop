from pathlib import Path
from datetime import datetime
import shutil
import re
import sys

ROOT = Path.cwd()
APP = ROOT / "src" / "App.jsx"
HOME = ROOT / "src" / "components" / "HomePage.jsx"
CSS = ROOT / "src" / "components" / "HomePage.css"

if not APP.exists() or not (ROOT / "src").exists():
    print("ERROR: Run this installer from the PigeonCop project root (the folder containing src/App.jsx).")
    sys.exit(1)

if HOME.exists():
    print("HomePage.jsx already exists. Installer stopped to avoid overwriting your work.")
    sys.exit(1)

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
backup_dir = ROOT / f".stitch-home-backup-{stamp}"
backup_dir.mkdir()
shutil.copy2(APP, backup_dir / "App.jsx")

app = APP.read_text(encoding="utf-8")

if 'import HomePage from "./components/HomePage";' not in app:
    app = app.replace(
        'import Camera from "./components/Camera";',
        'import Camera from "./components/Camera";\nimport HomePage from "./components/HomePage";',
        1
    )
    if 'import HomePage from "./components/HomePage";' not in app:
        app = app.replace(
            "import Camera from './components/Camera'",
            "import Camera from './components/Camera'\nimport HomePage from './components/HomePage'",
            1
        )

if 'const [pigeonCopView, setPigeonCopView]' not in app:
    match = re.search(r'function\s+App\s*\([^)]*\)\s*\{', app)
    if not match:
        print("ERROR: Could not locate function App() in src/App.jsx.")
        shutil.rmtree(backup_dir)
        sys.exit(1)
    app = app[:match.end()] + '\n    const [pigeonCopView, setPigeonCopView] = useState("home");' + app[match.end():]

if 'pigeonCopView === "home"' not in app:
    marker = re.search(r'\n\s*return\s*\(', app)
    if not marker:
        print("ERROR: Could not locate the App.jsx return block.")
        shutil.rmtree(backup_dir)
        sys.exit(1)
    guard = '''
    if (pigeonCopView === "home") {
        return <HomePage onTestNow={() => setPigeonCopView("monitor")} />;
    }
'''
    app = app[:marker.start()] + guard + app[marker.start():]

if 'className="pigeoncop-dashboard-nav"' not in app:
    header_marker = re.search(r'<Header\s*/>', app)
    if header_marker:
        nav = '''<div className="pigeoncop-dashboard-nav">
                <button type="button" onClick={() => setPigeonCopView("home")}>← HOME</button>
                <span>MONITORING CONSOLE</span>
            </div>
            '''
        app = app[:header_marker.start()] + nav + app[header_marker.start():]
    else:
        print("WARNING: Could not find <Header />. Homepage will still work, but no dashboard HOME button was added.")

APP.write_text(app, encoding="utf-8")

app_css = ROOT / "src" / "App.css"
css_text = app_css.read_text(encoding="utf-8") if app_css.exists() else ""
if ".pigeoncop-dashboard-nav" not in css_text:
    css_text += '''
\n/* Stitch-inspired product navigation */
.pigeoncop-dashboard-nav {
    max-width: 1240px;
    margin: 0 auto;
    padding: 12px 20px 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}
.pigeoncop-dashboard-nav button {
    border: 1px solid rgba(114, 239, 185, .25);
    background: rgba(255, 255, 255, .02);
    color: #aaffd8;
    padding: 8px 12px;
    font: 700 10px/1 "Space Grotesk", sans-serif;
    letter-spacing: .1em;
    cursor: pointer;
}
.pigeoncop-dashboard-nav button:hover { border-color: rgba(114,239,185,.55); }
.pigeoncop-dashboard-nav span {
    color: #708078;
    font: 600 9px/1 "Space Grotesk", sans-serif;
    letter-spacing: .13em;
}
@media (max-width: 640px) {
    .pigeoncop-dashboard-nav { padding-left: 12px; padding-right: 12px; }
}
'''
    app_css.write_text(css_text, encoding="utf-8")

installer_dir = Path(__file__).resolve().parent
shutil.copy2(installer_dir / "HomePage.jsx", HOME)
shutil.copy2(installer_dir / "HomePage.css", CSS)

print("SUCCESS: Stitch-inspired homepage installed.")
print(f"Backup created at: {backup_dir}")
print("TEST NOW opens the existing monitoring dashboard.")
print("A HOME button was added above the existing dashboard when <Header /> was found.")
print("Run: npm run dev")
