
from pathlib import Path
import re

ROOT = Path.cwd()

def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")

def write(rel, text):
    (ROOT / rel).write_text(text, encoding="utf-8")
    print("updated " + rel)

# App.jsx
path = "src/App.jsx"
s = read(path)

if "testVideoFile" not in s:
    m = re.search(r'(\s*const \[sourceMode, setSourceMode\]\s*=\s*useState\("live"\);)', s)
    if not m:
        raise SystemExit("Could not find sourceMode state in src/App.jsx")
    s = s[:m.end()] + "\n    const [testVideoFile, setTestVideoFile] = useState(null);" + s[m.end():]

if "testVideoFile={testVideoFile}" not in s:
    m = re.search(r'<Camera\b[\s\S]*?/>', s)
    if not m:
        raise SystemExit("Could not find <Camera ... /> in src/App.jsx")
    block = m.group(0)
    block = block[:-2] + "    testVideoFile={testVideoFile}\n            />"
    s = s[:m.start()] + block + s[m.end():]

if "onVideoSelect={setTestVideoFile}" not in s:
    m = re.search(r'<ControlPanel\b[\s\S]*?/>', s)
    if not m:
        raise SystemExit("Could not find <ControlPanel ... /> in src/App.jsx")
    block = m.group(0)
    block = block[:-2] + "    testVideoFile={testVideoFile}\n            onVideoSelect={setTestVideoFile}\n        />"
    s = s[:m.start()] + block + s[m.end():]

write(path, s)

# Camera.jsx
path = "src/components/Camera.jsx"
s = read(path)

if "testVideoFile," not in s:
    m = re.search(r'function Camera\(\{[\s\S]*?\n\}\) \{', s)
    if not m:
        raise SystemExit("Could not find Camera props destructuring in Camera.jsx")
    block = m.group(0).replace("\n}) {", "\n    testVideoFile,\n}) {", 1)
    s = s[:m.start()] + block + s[m.end():]

if "testVideoUrlRef" not in s:
    marker = "    const deterrentSoundRef = useRef(null);"
    if marker not in s:
        raise SystemExit("Could not find deterrentSoundRef in Camera.jsx")
    s = s.replace(marker, marker + "\n    const testVideoUrlRef = useRef(null);", 1)

if "URL.createObjectURL(testVideoFile)" not in s:
    old = 'videoRef.current.src =\n                        "/videos/pigeon-test.mp4";'
    if old not in s:
        raise SystemExit("Could not find built-in test video source in Camera.jsx")
    new = (
        'if (testVideoUrlRef.current) {\n'
        '                        URL.revokeObjectURL(testVideoUrlRef.current);\n'
        '                        testVideoUrlRef.current = null;\n'
        '                    }\n\n'
        '                    const videoSource = testVideoFile\n'
        '                        ? URL.createObjectURL(testVideoFile)\n'
        '                        : "/videos/pigeon-test.mp4";\n\n'
        '                    videoRef.current.src = videoSource;\n\n'
        '                    testVideoUrlRef.current = testVideoFile\n'
        '                        ? videoSource\n'
        '                        : null;'
    )
    s = s.replace(old, new, 1)

if "REVOKE UPLOADED VIDEO URL" not in s:
    marker = "    // CAMERA STATUS"
    if marker not in s:
        raise SystemExit("Could not find CAMERA STATUS section in Camera.jsx")
    cleanup = (
        '    // REVOKE UPLOADED VIDEO URL\n'
        '    useEffect(() => {\n'
        '        return () => {\n'
        '            if (testVideoUrlRef.current) {\n'
        '                URL.revokeObjectURL(testVideoUrlRef.current);\n'
        '                testVideoUrlRef.current = null;\n'
        '            }\n'
        '        };\n'
        '    }, []);\n\n'
    )
    s = s.replace(marker, cleanup + marker, 1)

if "uploaded-video-name" not in s:
    m = re.search(r'(<h5 className="camera-title">[\s\S]*?</h5>)', s)
    if not m:
        raise SystemExit("Could not find camera title in Camera.jsx")
    extra = (
        '\n\n                    {sourceMode === "test" && testVideoFile && (\n'
        '                        <div className="uploaded-video-name">\n'
        '                            {testVideoFile.name}\n'
        '                        </div>\n'
        '                    )}'
    )
    s = s[:m.end()] + extra + s[m.end():]

write(path, s)

# ControlPanel.jsx
path = "src/components/ControlPanel.jsx"
s = read(path)

if "onVideoSelect" not in s:
    marker = "    setSourceMode,"
    if marker not in s:
        raise SystemExit("Could not find setSourceMode in ControlPanel.jsx")
    s = s.replace(marker, marker + "\n    testVideoFile,\n    onVideoSelect,", 1)

if 'className="video-selector"' not in s:
    marker = '\n            <div className="control-actions">'
    if marker not in s:
        raise SystemExit("Could not find control-actions in ControlPanel.jsx")
    block = (
        '\n            {sourceMode === "test" && (\n'
        '                <div className="video-selector">\n'
        '                    <span className="section-kicker">\n'
        '                        TEST VIDEO\n'
        '                    </span>\n\n'
        '                    <label className="video-upload">\n'
        '                        <span>\n'
        '                            {testVideoFile ? "Change Video" : "Choose Video"}\n'
        '                        </span>\n'
        '                        <input\n'
        '                            type="file"\n'
        '                            accept="video/*"\n'
        '                            onChange={(event) => {\n'
        '                                const file = event.target.files?.[0] ?? null;\n'
        '                                onVideoSelect(file);\n'
        '                                event.target.value = "";\n'
        '                            }}\n'
        '                            disabled={status === "active" || status === "loading"}\n'
        '                        />\n'
        '                    </label>\n\n'
        '                    <small className="video-file-name">\n'
        '                        {testVideoFile ? testVideoFile.name : "Built-in demo video"}\n'
        '                    </small>\n'
        '                </div>\n'
        '            )}\n'
    )
    s = s.replace(marker, block + marker, 1)

write(path, s)

# App.css
path = "src/App.css"
s = read(path)

if "/* PigeonCop Phase 2 video upload */" not in s:
    css = (
        "\n\n/* PigeonCop Phase 2 video upload */\n"
        ".video-selector {\n"
        "    display: flex;\n"
        "    flex-direction: column;\n"
        "    gap: 7px;\n"
        "    min-width: 200px;\n"
        "}\n\n"
        ".video-upload {\n"
        "    position: relative;\n"
        "    min-height: 38px;\n"
        "    padding: 0 14px;\n"
        "    display: inline-flex;\n"
        "    align-items: center;\n"
        "    justify-content: center;\n"
        "    border: 1px solid rgba(255, 255, 255, 0.08);\n"
        "    border-radius: 10px;\n"
        "    background: #0a100c;\n"
        "    color: #cdd8d1;\n"
        "    font-size: 0.70rem;\n"
        "    font-weight: 760;\n"
        "    cursor: pointer;\n"
        "}\n\n"
        ".video-upload:hover {\n"
        "    border-color: rgba(37, 217, 131, 0.25);\n"
        "    background: rgba(37, 217, 131, 0.045);\n"
        "    color: #edf5ef;\n"
        "}\n\n"
        ".video-upload input {\n"
        "    position: absolute;\n"
        "    width: 1px;\n"
        "    height: 1px;\n"
        "    opacity: 0;\n"
        "    pointer-events: none;\n"
        "}\n\n"
        ".video-file-name, .uploaded-video-name {\n"
        "    max-width: 320px;\n"
        "    overflow: hidden;\n"
        "    text-overflow: ellipsis;\n"
        "    white-space: nowrap;\n"
        "    color: #68756d;\n"
        "    font-size: 0.62rem;\n"
        "}\n\n"
        "@media (max-width: 1020px) {\n"
        "    .video-selector { width: 100%; }\n"
        "}\n"
    )
    s = s.rstrip() + css

write(path, s)

print("")
print("PigeonCop Phase 2 video upload installed successfully.")
print("Select SOURCE -> Test Video. The Choose Video control will appear.")
