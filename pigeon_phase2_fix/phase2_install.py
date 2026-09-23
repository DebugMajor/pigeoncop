from pathlib import Path

root = Path.cwd()


def replace(path, replacements):
    p = root / path
    s = p.read_text(encoding="utf-8")
    original = s
    for old, new in replacements:
        if old not in s:
            raise SystemExit(f"Could not find expected text in {path}: {old[:100]!r}")
        s = s.replace(old, new, 1)
    p.write_text(s, encoding="utf-8")
    print(f"updated {path}")

replace("src/App.jsx", [
    (
        '    const [sourceMode, setSourceMode] = useState("live");\n',
        '    const [sourceMode, setSourceMode] = useState("live");\n    const [testVideoFile, setTestVideoFile] = useState(null);\n'
    ),
    (
        '                                playbackAction={\n                                    playbackAction\n                                }\n                            />',
        '                                playbackAction={\n                                    playbackAction\n                                }\n                                testVideoFile={\n                                    testVideoFile\n                                }\n                            />'
    ),
    (
        '                            setSourceMode={\n                                setSourceMode\n                            }\n                            onResetTest={',
        '                            setSourceMode={\n                                setSourceMode\n                            }\n                            testVideoFile={\n                                testVideoFile\n                            }\n                            onVideoSelect={\n                                setTestVideoFile\n                            }\n                            onResetTest={'
    ),
])

replace("src/components/Camera.jsx", [
    (
        '    playbackCommand,\n    playbackAction,\n}) {',
        '    playbackCommand,\n    playbackAction,\n    testVideoFile,\n}) {'
    ),
    (
        '    const deterrentSoundRef = useRef(null);\n    const deterrentCooldownUntilRef =',
        '    const deterrentSoundRef = useRef(null);\n    const testVideoUrlRef = useRef(null);\n    const deterrentCooldownUntilRef ='
    ),
    (
        '                    videoRef.current.src =\n                        "/videos/pigeon-test.mp4";',
        '                    if (testVideoUrlRef.current) {\n                        URL.revokeObjectURL(testVideoUrlRef.current);\n                        testVideoUrlRef.current = null;\n                    }\n\n                    const videoSource = testVideoFile\n                        ? URL.createObjectURL(testVideoFile)\n                        : "/videos/pigeon-test.mp4";\n\n                    videoRef.current.src = videoSource;\n                    testVideoUrlRef.current = testVideoFile\n                        ? videoSource\n                        : null;'
    ),
    (
        '    // CAMERA STATUS\n    useEffect(() => {',
        '    // CLEAN UP UPLOADED VIDEO URL\n    useEffect(() => {\n        return () => {\n            if (testVideoUrlRef.current) {\n                URL.revokeObjectURL(testVideoUrlRef.current);\n                testVideoUrlRef.current = null;\n            }\n        };\n    }, []);\n\n    // CAMERA STATUS\n    useEffect(() => {'
    ),
    (
        '    // STOP CAMERA\n    function stopCamera() {',
        '    // STOP CAMERA\n    function stopCamera() {'
    ),
    (
        '        setStatus("offline");\n\n        clearInterval(',
        '        if (testVideoUrlRef.current) {\n            URL.revokeObjectURL(testVideoUrlRef.current);\n            testVideoUrlRef.current = null;\n        }\n\n        setStatus("offline");\n\n        clearInterval('
    ),
    (
        '                    <h5 className="camera-title">\n                        {sourceMode ===\n                            "test"\n                            ? "Test Video Feed"\n                            : "Live Camera Feed"}\n                    </h5>',
        '                    <h5 className="camera-title">\n                        {sourceMode ===\n                            "test"\n                            ? "Test Video Feed"\n                            : "Live Camera Feed"}\n                    </h5>\n\n                    {sourceMode === "test" && testVideoFile && (\n                        <div className="uploaded-video-name">\n                            {testVideoFile.name}\n                        </div>\n                    )}'
    ),
])

replace("src/components/ControlPanel.jsx", [
    (
        '    setSourceMode,\n    onResetTest,',
        '    setSourceMode,\n    testVideoFile,\n    onVideoSelect,\n    onResetTest,'
    ),
    (
        '            </div>\n\n            <div className="control-actions">',
        '''            </div>\n\n            {sourceMode === "test" && (\n                <div className="video-selector">\n                    <span className="section-kicker">TEST VIDEO</span>\n\n                    <label className="video-upload">\n                        <span>{testVideoFile ? "Change Video" : "Choose Video"}</span>\n                        <input\n                            type="file"\n                            accept="video/*"\n                            onChange={(event) => {\n                                const file = event.target.files?.[0] ?? null;\n                                onVideoSelect(file);\n                                event.target.value = "";\n                            }}\n                            disabled={status === "active" || status === "loading"}\n                        />\n                    </label>\n\n                    <small className="video-file-name">\n                        {testVideoFile ? testVideoFile.name : "Built-in demo video"}\n                    </small>\n                </div>\n            )}\n\n            <div className="control-actions">'''
    ),
])

css = r'''
/* Phase 2 — user-uploaded test video */
.video-selector {
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-width: 200px;
}

.video-upload {
    position: relative;
    min-height: 38px;
    padding: 0 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    background: #0a100c;
    color: #cdd8d1;
    font-size: 0.70rem;
    font-weight: 760;
    cursor: pointer;
    transition: 0.18s ease;
}

.video-upload:hover {
    border-color: rgba(37, 217, 131, 0.25);
    background: rgba(37, 217, 131, 0.045);
    color: #edf5ef;
}

.video-upload input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
}

.video-upload:has(input:disabled) {
    opacity: 0.38;
    cursor: not-allowed;
}

.video-file-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #68756d;
    font-size: 0.62rem;
}

.uploaded-video-name {
    max-width: 320px;
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #65736a;
    font-size: 0.62rem;
}

@media (min-width: 1021px) {
    .control-panel {
        grid-template-columns:
            minmax(230px, 0.9fr)
            minmax(190px, 0.8fr)
            minmax(250px, 1fr)
            minmax(360px, 1.45fr);
    }
}

@media (max-width: 1020px) {
    .video-selector {
        grid-column: 1 / -1;
        width: 100%;
    }
}
'''

p = root / "src/App.css"
s = p.read_text(encoding="utf-8")
if "/* Phase 2 — user-uploaded test video */" not in s:
    p.write_text(s + "\n" + css, encoding="utf-8")
    print("updated src/App.css")
else:
    print("src/App.css already contains Phase 2 CSS")

print("PigeonCop Phase 2 video upload installed successfully.")
