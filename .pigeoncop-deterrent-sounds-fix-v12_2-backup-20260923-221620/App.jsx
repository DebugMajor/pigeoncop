import Camera from "./components/Camera";
import Footer from "./components/Footer";
import "./dashboard-deployment-v12.css";
import "./dashboard-deployment-v12_1.css";
import { useEffect, useMemo, useRef, useState } from "react";

const DETTERENT_SOUNDS = {
    "soothing-rock": {
        label: "Soothing Rock",
        path: "/sounds/motion-feedback-soothing-rock.wav",
    },
    "loud-alert": {
        label: "Loud Alert",
        path: "/sounds/deterrent-loud-alert.wav",
    },
    "high-frequency": {
        label: "High Frequency",
        path: "/sounds/deterrent-high-frequency.wav",
    },
    "high-frequency-pulse": {
        label: "High Frequency Pulse",
        path: "/sounds/deterrent-high-frequency-pulse.wav",
    },
    gunshot: {
        label: "Gunshot",
        path: "/sounds/deterrent-gunshot.wav",
    },
};

function formatTime(date) {
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function formatDate(date) {
    return date.toLocaleDateString([], {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatDuration(totalSeconds) {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
}

function DetectionRow({ detection, compact = false }) {
    const type = detection.type === "human"
        ? "Human"
        : detection.type === "bird"
            ? detection.name || "Pigeon"
            : "Motion";

    const confidence =
        typeof detection.confidence === "number"
            ? `${Math.round(detection.confidence * 100)}%`
            : "—";

    return (
        <article className={`pcdc-detection-row ${compact ? "compact" : ""}`}>
            <div className="pcdc-detection-thumb">
                {detection.snapshot ? (
                    <img src={detection.snapshot} alt={`${type} detection`} />
                ) : (
                    <span>{type === "Pigeon" ? "P" : type === "Human" ? "H" : "M"}</span>
                )}
            </div>

            <div className="pcdc-detection-copy">
                <div className="pcdc-detection-name">
                    <strong>{type}</strong>
                    {detection.deterrentStatus && (
                        <span className="pcdc-badge">{detection.deterrentStatus}</span>
                    )}
                </div>
                <span>{confidence} confidence</span>
                <time>{new Date(detection.timestamp).toLocaleTimeString()}</time>
            </div>
        </article>
    );
}

function EmptyState({ title = "No confirmed events", text = "Monitoring activity will appear here." }) {
    return (
        <div className="pcdc-empty-state">
            <div className="pcdc-empty-mark">+</div>
            <div>
                <strong>{title}</strong>
                <span>{text}</span>
            </div>
        </div>
    );
}

function App() {
    const [status, setStatus] = useState("offline");
    const [detections, setDetections] = useState([]);
    const [motionEvents, setMotionEvents] = useState(0);
    const [deterrentEvents, setDeterrentEvents] = useState(0);
    const [sourceMode, setSourceMode] = useState("live");
    const [testVideoFile, setTestVideoFile] = useState(null);
    const [testVideoPlaying, setTestVideoPlaying] = useState(false);
    const [deterrentSound, setDeterrentSound] = useState("soothing-rock");
    const [testSoundPlaying, setTestSoundPlaying] = useState(false);
    const [playbackCommand, setPlaybackCommand] = useState(0);
    const [playbackAction, setPlaybackAction] = useState("play");
    const [resetTrigger, setResetTrigger] = useState(0);
    const [now, setNow] = useState(new Date());
    const [sessionSeconds, setSessionSeconds] = useState(0);

    const testSoundRef = useRef(null);
    const sessionStartRef = useRef(null);

    const selectedSound = useMemo(
        () => DETTERENT_SOUNDS[deterrentSound] || DETTERENT_SOUNDS["soothing-rock"],
        [deterrentSound]
    );

    const birdCount = detections.filter((item) => item.type === "bird").length;
    const humanCount = detections.filter((item) => item.type === "human").length;
    const confidenceValues = detections
        .filter((item) => typeof item.confidence === "number")
        .map((item) => item.confidence);

    const averageConfidence = confidenceValues.length
        ? confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length
        : null;

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    function stopTestSound() {
        if (testSoundRef.current) {
            testSoundRef.current.pause();
            testSoundRef.current.currentTime = 0;
        }
        setTestSoundPlaying(false);
    }

    useEffect(() => {
        if (status !== "active") {
            stopTestSound();
            setTestVideoPlaying(false);
            sessionStartRef.current = null;
            setSessionSeconds(0);
            return undefined;
        }

        sessionStartRef.current = Date.now();

        if (sourceMode === "test") {
            setTestVideoPlaying(true);
        }

        const timer = setInterval(() => {
            if (sessionStartRef.current) {
                setSessionSeconds(
                    Math.floor((Date.now() - sessionStartRef.current) / 1000)
                );
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [status, sourceMode]);

    useEffect(() => {
        return () => stopTestSound();
    }, []);

    useEffect(() => {
        stopTestSound();
    }, [deterrentSound]);

    function handleDetection(detection) {
        setDetections((previous) => [detection, ...previous].slice(0, 30));
    }

    function handleMotion() {
        setMotionEvents((previous) => previous + 1);
    }

    function handleDeterrent() {
        setDeterrentEvents((previous) => previous + 1);
    }

    function handleStart() {
        if (status === "active" || status === "loading") return;
        stopTestSound();
        setStatus("loading");
    }

    function handleStop() {
        stopTestSound();
        setPlaybackAction("pause");
        setPlaybackCommand((previous) => previous + 1);
        setStatus("stopping");
    }

    function handleTogglePlayback() {
        const nextPlaying = !testVideoPlaying;
        setTestVideoPlaying(nextPlaying);
        setPlaybackAction(nextPlaying ? "play" : "pause");
        setPlaybackCommand((previous) => previous + 1);

        if (!nextPlaying) {
            stopTestSound();
        }
    }

    function handleReset() {
        stopTestSound();
        setDetections([]);
        setMotionEvents(0);
        setDeterrentEvents(0);
        setPlaybackAction("play");
        setTestVideoPlaying(true);
        setResetTrigger((previous) => previous + 1);
    }

    function handleTestSound() {
        const targetUrl = new URL(selectedSound.path, window.location.href).href;

        if (!testSoundRef.current || testSoundRef.current.src !== targetUrl) {
            stopTestSound();

            const audio = new Audio(selectedSound.path);
            audio.preload = "auto";
            audio.volume = 1;
            audio.addEventListener("ended", () => setTestSoundPlaying(false));

            testSoundRef.current = audio;
        }

        if (!testSoundRef.current.paused) {
            stopTestSound();
            return;
        }

        testSoundRef.current.currentTime = 0;
        testSoundRef.current
            .play()
            .then(() => setTestSoundPlaying(true))
            .catch(() => setTestSoundPlaying(false));
    }

    return (
        <div className="pcdc-app">
            <header className="pcdc-header">
                <div className="pcdc-header-inner">
                    <a className="pcdc-brand" href="/" aria-label="Return to PigeonCop home">
                        <img src="/logo-wordmark.png" alt="PigeonCop" />
                    </a>

                    <div className="pcdc-brand-meta" aria-label="Product characteristics">
                        <span className="active">EDGE AI</span>
                        <i />
                        <span>LOCAL INFERENCE</span>
                        <i />
                        <span>REAL-TIME</span>
                    </div>

                    <div className="pcdc-header-state">
                        <span className="pcdc-live-dot" />
                        <span>{status === "active" ? "SYSTEM ACTIVE" : "SYSTEM READY"}</span>
                    </div>
                </div>
            </header>

            <main className="pcdc-main">
                <div className="pcdc-titlebar">
                    <div>
                        <span className="pcdc-kicker">MONITORING CONSOLE</span>
                        <h1>{sourceMode === "test" ? "Test Video" : "Live Camera"}</h1>
                    </div>

                    <div className="pcdc-title-status">
                        <span className={status === "active" ? "active" : ""}>
                            <i />
                            {status === "active" ? "Monitoring Active" : "Standby"}
                        </span>
                        <span className="pcdc-ai-state">
                            <i />
                            AI {status === "active" ? "ACTIVE" : "READY"}
                        </span>
                        <time>{formatDate(now)} · {formatTime(now)}</time>
                    </div>
                </div>

                <section className="pcdc-workspace">
                    <section className="pcdc-left">
                        <div className="pcdc-camera-card">
                            <div className="pcdc-camera-header">
                                <div>
                                    <span>CAMERA 01 · MAIN VIEW</span>
                                    <small>
                                        {sourceMode === "test"
                                            ? testVideoFile?.name || "Built-in test environment"
                                            : "Browser camera source"}
                                    </small>
                                </div>
                                <span className="pcdc-live-badge">
                                    <i />
                                    {status === "active" ? "LIVE" : "READY"}
                                </span>
                            </div>

                            <div className="pcdc-camera-stage">
                                <Camera
                                    status={status}
                                    setStatus={setStatus}
                                    onDetection={handleDetection}
                                    onMotion={handleMotion}
                                    onDeterrent={handleDeterrent}
                                    sourceMode={sourceMode}
                                    resetTrigger={resetTrigger}
                                    playbackCommand={playbackCommand}
                                    playbackAction={playbackAction}
                                    testVideoFile={testVideoFile}
                                    deterrentSoundPath={selectedSound.path}
                                />
                            </div>

                            <div className="pcdc-camera-footer">
                                <span><i /> Motion {status === "active" ? "monitoring" : "standby"}</span>
                                <span>V3 · ONNX</span>
                                <span>WEBGPU</span>
                            </div>
                        </div>

                        <div className="pcdc-control-card">
                            <div className="pcdc-control-intro">
                                <span className="pcdc-kicker">CONTROL</span>
                                <strong>Monitoring Controls</strong>
                                <small>Manage source, detection and deterrent response.</small>
                            </div>

                            <div className="pcdc-control-group">
                                <span>SOURCE</span>
                                <div className="pcdc-segment">
                                    <button
                                        className={sourceMode === "live" ? "active" : ""}
                                        disabled={status === "active" || status === "loading"}
                                        onClick={() => setSourceMode("live")}
                                    >
                                        Live Camera
                                    </button>
                                    <button
                                        className={sourceMode === "test" ? "active" : ""}
                                        disabled={status === "active" || status === "loading"}
                                        onClick={() => setSourceMode("test")}
                                    >
                                        Test Video
                                    </button>
                                </div>

                                {sourceMode === "test" && (
                                    <label className="pcdc-file-picker">
                                        <span>{testVideoFile ? "Change Video" : "Choose Video"}</span>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            disabled={status === "active" || status === "loading"}
                                            onChange={(event) => {
                                                setTestVideoFile(event.target.files?.[0] || null);
                                                event.target.value = "";
                                            }}
                                        />
                                        <small>{testVideoFile?.name || "Built-in demo"}</small>
                                    </label>
                                )}
                            </div>

                            <label className="pcdc-control-group">
                                <span>DETERRENT SOUND</span>
                                <select
                                    value={deterrentSound}
                                    onChange={(event) => setDeterrentSound(event.target.value)}
                                    disabled={status === "active" || status === "loading"}
                                >
                                    {Object.entries(DETERRENT_SOUNDS).map(([key, sound]) => (
                                        <option value={key} key={key}>
                                            {sound.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="pcdc-control-actions">
                                <button className="primary" onClick={handleStart} disabled={status === "active" || status === "loading"}>
                                    Start Monitoring
                                </button>

                                <button className="secondary" onClick={handleStop} disabled={status === "offline" || status === "error"}>
                                    Stop
                                </button>

                                {sourceMode === "test" && (
                                    <button
                                        className="secondary"
                                        onClick={handleTogglePlayback}
                                        disabled={status !== "active"}
                                    >
                                        {testVideoPlaying ? "Pause Test" : "Play Test"}
                                    </button>
                                )}

                                <button
                                    className={testSoundPlaying ? "sound-playing" : "secondary"}
                                    onClick={handleTestSound}
                                >
                                    {testSoundPlaying ? "Stop Sound" : "Test Sound"}
                                </button>

                                {sourceMode === "test" && (
                                    <button
                                        className="ghost"
                                        onClick={handleReset}
                                        disabled={status !== "active"}
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>

                        <section className="pcdc-activity-card">
                            <div className="pcdc-section-head">
                                <div>
                                    <span className="pcdc-kicker">SESSION ACTIVITY</span>
                                    <h2>Detection Events</h2>
                                </div>
                                <span className="pcdc-count">{detections.length}</span>
                            </div>

                            <div className="pcdc-activity-content">
                                {detections.length === 0 ? (
                                    <EmptyState />
                                ) : (
                                    detections.slice(0, 4).map((item) => (
                                        <DetectionRow key={item.id} detection={item} compact />
                                    ))
                                )}
                            </div>
                        </section>
                    </section>

                    <aside className="pcdc-right">
                        <section className="pcdc-panel pcdc-recent-panel">
                            <div className="pcdc-section-head">
                                <div>
                                    <span className="pcdc-kicker">ACTIVITY</span>
                                    <h2>Recent Detections</h2>
                                </div>
                                <span className="pcdc-live-text">Live session</span>
                            </div>

                            <div className="pcdc-recent-list">
                                {detections.length === 0 ? (
                                    <EmptyState title="No detections yet" text="Waiting for a confirmed bird event." />
                                ) : (
                                    detections.slice(0, 5).map((item) => (
                                        <DetectionRow key={item.id} detection={item} />
                                    ))
                                )}
                            </div>
                        </section>

                        <section className="pcdc-panel pcdc-status-panel">
                            <div className="pcdc-section-head">
                                <div>
                                    <span className="pcdc-kicker">SYSTEM</span>
                                    <h2>Session Status</h2>
                                </div>
                                <span className="pcdc-online">
                                    <i />
                                    {status === "active" ? "ONLINE" : "READY"}
                                </span>
                            </div>

                            <div className="pcdc-metrics">
                                <div><span>BIRDS</span><strong>{birdCount}</strong><small>confirmed</small></div>
                                <div><span>HUMANS</span><strong>{humanCount}</strong><small>detected</small></div>
                                <div><span>DETERRENTS</span><strong>{deterrentEvents}</strong><small>activations</small></div>
                                <div><span>MOTION</span><strong>{motionEvents}</strong><small>events</small></div>
                                <div><span>RUNTIME</span><strong>{formatDuration(sessionSeconds)}</strong><small>this session</small></div>
                                <div><span>CONFIDENCE</span><strong>{averageConfidence === null ? "—" : `${Math.round(averageConfidence * 100)}%`}</strong><small>average</small></div>
                            </div>

                            <div className="pcdc-engine">
                                <div>
                                    <span className="pcdc-kicker">AI ENGINE</span>
                                    <strong>{status === "active" ? "RUNNING" : "STANDBY"}</strong>
                                </div>
                                <small>YOLO V3 · ONNX · WebGPU</small>
                            </div>
                        </section>
                    </aside>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default App;
