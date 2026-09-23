import Camera from "./components/Camera";
import Header from "./components/Header";
import "./App.css";
import "./sound-selection.css";
import "./dashboard-deploy.css";
import { useEffect, useRef, useState } from "react";

const deterrentSounds = {
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

function formatClock(date) {
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

function formatRuntime(seconds) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
}

function EventCard({ detection }) {
    const isBird = detection.type === "bird";
    const isHuman = detection.type === "human";
    const label = isBird
        ? detection.name || "Pigeon"
        : isHuman
            ? "Human"
            : "Motion";

    return (
        <article className="pcd-event">
            <div className="pcd-event-thumb">
                {detection.snapshot ? (
                    <img src={detection.snapshot} alt={`${label} detection`} />
                ) : (
                    <span>{isBird ? "P" : isHuman ? "H" : "M"}</span>
                )}
            </div>

            <div className="pcd-event-copy">
                <div className="pcd-event-top">
                    <strong>{label}</strong>
                    {isBird && (
                        <span className="pcd-event-state">
                            {detection.deterrentStatus || "CONFIRMED"}
                        </span>
                    )}
                </div>
                <span className="pcd-event-meta">
                    {typeof detection.confidence === "number"
                        ? `${(detection.confidence * 100).toFixed(0)}% confidence`
                        : "Motion event"}
                </span>
                <time>{new Date(detection.timestamp).toLocaleTimeString()}</time>
            </div>
        </article>
    );
}

function Metric({ label, value, hint }) {
    return (
        <div className="pcd-metric">
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{hint}</small>
        </div>
    );
}

function ControlDock({
    status,
    setStatus,
    sourceMode,
    setSourceMode,
    testVideoFile,
    onVideoSelect,
    testVideoPlaying,
    onTogglePlayback,
    deterrentSound,
    setDeterrentSound,
    onResetTest,
    onTestSound,
    testSoundPlaying,
}) {
    return (
        <section className="pcd-control-dock">
            <div className="pcd-control-title">
                <span className="pcd-kicker">CONTROL DECK</span>
                <strong>Monitoring Controls</strong>
            </div>

            <div className="pcd-source">
                <span className="pcd-field-label">SOURCE</span>
                <div className="pcd-segment">
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
                    <label className="pcd-file-row">
                        <span className="pcd-file-btn">
                            {testVideoFile ? "Change Video" : "Choose Video"}
                        </span>
                        <input
                            type="file"
                            accept="video/*"
                            disabled={status === "active" || status === "loading"}
                            onChange={(event) => {
                                onVideoSelect(event.target.files?.[0] || null);
                                event.target.value = "";
                            }}
                        />
                        <span className="pcd-file-name">
                            {testVideoFile ? testVideoFile.name : "Built-in demo"}
                        </span>
                    </label>
                )}
            </div>

            <label className="pcd-sound">
                <span className="pcd-field-label">DETERRENT</span>
                <select
                    value={deterrentSound}
                    onChange={(event) => setDeterrentSound(event.target.value)}
                    disabled={status === "active" || status === "loading"}
                >
                    {Object.entries(deterrentSounds).map(([key, sound]) => (
                        <option key={key} value={key}>
                            {sound.label}
                        </option>
                    ))}
                </select>
            </label>

            <div className="pcd-actions">
                <button
                    className="primary"
                    disabled={status === "active" || status === "loading"}
                    onClick={() => setStatus("loading")}
                >
                    Start Monitoring
                </button>

                <button
                    className="secondary"
                    disabled={status === "offline" || status === "error"}
                    onClick={() => setStatus("stopping")}
                >
                    Stop
                </button>

                {sourceMode === "test" && status === "active" && (
                    <button className="secondary" onClick={onTogglePlayback}>
                        {testVideoPlaying ? "Pause Test" : "Play Test"}
                    </button>
                )}

                <button
                    className={testSoundPlaying ? "sound-active" : "secondary"}
                    onClick={onTestSound}
                >
                    {testSoundPlaying ? "Stop Sound" : "Test Sound"}
                </button>

                {sourceMode === "test" && (
                    <button
                        className="ghost"
                        disabled={status !== "active"}
                        onClick={onResetTest}
                    >
                        Reset
                    </button>
                )}
            </div>
        </section>
    );
}

function App() {
    const [status, setStatus] = useState("offline");
    const [detections, setDetections] = useState([]);
    const [motionEvents, setMotionEvents] = useState(0);
    const [deterrentEvents, setDeterrentEvents] = useState(0);
    const [sourceMode, setSourceMode] = useState("live");
    const [testVideoFile, setTestVideoFile] = useState(null);
    const [deterrentSound, setDeterrentSound] = useState("soothing-rock");
    const [testSoundPlaying, setTestSoundPlaying] = useState(false);
    const [testVideoPlaying, setTestVideoPlaying] = useState(false);
    const [playbackCommand, setPlaybackCommand] = useState(0);
    const [playbackAction, setPlaybackAction] = useState("play");
    const [resetTrigger, setResetTrigger] = useState(0);
    const [now, setNow] = useState(new Date());
    const [sessionSeconds, setSessionSeconds] = useState(0);

    const sessionStartRef = useRef(null);
    const testSoundRef = useRef(null);

    const soundPath = deterrentSounds[deterrentSound].path;

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (status !== "active") {
            setTestVideoPlaying(false);
            setSessionSeconds(0);
            sessionStartRef.current = null;
            stopTestSound();
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
        return () => {
            stopTestSound();
        };
    }, []);

    function stopTestSound() {
        if (testSoundRef.current) {
            testSoundRef.current.pause();
            testSoundRef.current.currentTime = 0;
        }
        setTestSoundPlaying(false);
    }

    function handleTestSound() {
        const sourceUrl = new URL(soundPath, window.location.href).href;

        if (!testSoundRef.current || testSoundRef.current.src !== sourceUrl) {
            stopTestSound();
            testSoundRef.current = new Audio(soundPath);
            testSoundRef.current.preload = "auto";
            testSoundRef.current.volume = 1;
            testSoundRef.current.addEventListener("ended", () => {
                setTestSoundPlaying(false);
            });
        }

        if (!testSoundRef.current.paused) {
            stopTestSound();
            return;
        }

        testSoundRef.current.currentTime = 0;
        testSoundRef.current.play()
            .then(() => setTestSoundPlaying(true))
            .catch(() => setTestSoundPlaying(false));
    }

    function handleDetection(detection) {
        setDetections((prev) => [detection, ...prev].slice(0, 30));
    }

    function handleMotion() {
        setMotionEvents((prev) => prev + 1);
    }

    function handleDeterrent() {
        setDeterrentEvents((prev) => prev + 1);
    }

    function handleTogglePlayback() {
        const nextPlaying = !testVideoPlaying;
        setTestVideoPlaying(nextPlaying);
        setPlaybackAction(nextPlaying ? "play" : "pause");
        setPlaybackCommand((prev) => prev + 1);

        if (!nextPlaying) {
            stopTestSound();
        }
    }

    function handleResetTest() {
        stopTestSound();
        setDetections([]);
        setMotionEvents(0);
        setDeterrentEvents(0);
        setTestVideoPlaying(true);
        setPlaybackAction("play");
        setResetTrigger((prev) => prev + 1);
    }

    const birdCount = detections.filter((item) => item.type === "bird").length;
    const humanCount = detections.filter((item) => item.type === "human").length;
    const confidenceItems = detections.filter(
        (item) => typeof item.confidence === "number"
    );
    const avgConfidence = confidenceItems.length
        ? confidenceItems.reduce((sum, item) => sum + item.confidence, 0) /
          confidenceItems.length
        : null;

    return (
        <div className="pcd-app">
            <Header status={status} />

            <main className="pcd-main">
                <header className="pcd-titlebar">
                    <div>
                        <span className="pcd-kicker">MONITORING CONSOLE</span>
                        <h1>{sourceMode === "test" ? "Test Video" : "Live Camera"}</h1>
                    </div>

                    <div className="pcd-live-meta">
                        <span className={`pcd-state ${status === "active" ? "active" : ""}`}>
                            <i />
                            {status === "active" ? "Monitoring Active" : "Standby"}
                        </span>
                        <span className="pcd-ai">
                            <i />
                            AI {status === "active" ? "ACTIVE" : "READY"}
                        </span>
                        <time>{formatDate(now)} · {formatClock(now)}</time>
                    </div>
                </header>

                <section className="pcd-workspace">
                    <div className="pcd-left">
                        <section className="pcd-camera">
                            <div className="pcd-camera-head">
                                <div>
                                    <span className="pcd-camera-title">CAMERA 01 · MAIN VIEW</span>
                                    <span className="pcd-camera-source">
                                        {sourceMode === "test"
                                            ? testVideoFile?.name || "Built-in test environment"
                                            : "Browser camera source"}
                                    </span>
                                </div>
                                <span className="pcd-live-badge">
                                    <i />
                                    {status === "active" ? "LIVE" : "READY"}
                                </span>
                            </div>

                            <div className="pcd-camera-frame">
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
                                    deterrentSoundPath={soundPath}
                                />
                            </div>

                            <div className="pcd-camera-foot">
                                <span><i /> Motion {status === "active" ? "monitoring" : "standby"}</span>
                                <span>V3 / ONNX</span>
                                <span>WEBGPU</span>
                            </div>
                        </section>

                        <ControlDock
                            status={status}
                            setStatus={setStatus}
                            sourceMode={sourceMode}
                            setSourceMode={setSourceMode}
                            testVideoFile={testVideoFile}
                            onVideoSelect={setTestVideoFile}
                            testVideoPlaying={testVideoPlaying}
                            onTogglePlayback={handleTogglePlayback}
                            deterrentSound={deterrentSound}
                            setDeterrentSound={setDeterrentSound}
                            onResetTest={handleResetTest}
                            onTestSound={handleTestSound}
                            testSoundPlaying={testSoundPlaying}
                        />

                        <section className="pcd-activity">
                            <div className="pcd-section-head">
                                <div>
                                    <span className="pcd-kicker">SESSION ACTIVITY</span>
                                    <h2>Detection Events</h2>
                                </div>
                                <span className="pcd-count">{detections.length}</span>
                            </div>

                            {detections.length === 0 ? (
                                <div className="pcd-empty">
                                    <div className="pcd-empty-icon">+</div>
                                    <div>
                                        <strong>No confirmed events yet</strong>
                                        <span>Detection activity will appear here during a session.</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="pcd-event-list">
                                    {detections.slice(0, 4).map((item) => (
                                        <EventCard key={item.id} detection={item} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="pcd-right">
                        <section className="pcd-panel pcd-recent">
                            <div className="pcd-section-head">
                                <div>
                                    <span className="pcd-kicker">ACTIVITY</span>
                                    <h2>Recent Detections</h2>
                                </div>
                                <span className="pcd-status-link">Live</span>
                            </div>

                            <div className="pcd-recent-list">
                                {detections.slice(0, 5).map((item) => (
                                    <EventCard key={`recent-${item.id}`} detection={item} />
                                ))}

                                {detections.length === 0 && (
                                    <div className="pcd-right-empty">
                                        <span>+</span>
                                        <div>
                                            <strong>No detections</strong>
                                            <small>Waiting for a confirmed event.</small>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="pcd-panel pcd-status-panel">
                            <div className="pcd-section-head">
                                <div>
                                    <span className="pcd-kicker">SYSTEM</span>
                                    <h2>Session Status</h2>
                                </div>
                                <span className="pcd-online">
                                    <i />
                                    {status === "active" ? "ONLINE" : "READY"}
                                </span>
                            </div>

                            <div className="pcd-metric-grid">
                                <Metric label="BIRDS" value={birdCount} hint="confirmed" />
                                <Metric label="HUMANS" value={humanCount} hint="detected" />
                                <Metric label="DETERRENTS" value={deterrentEvents} hint="activations" />
                                <Metric label="MOTION" value={motionEvents} hint="events" />
                                <Metric label="RUNTIME" value={formatRuntime(sessionSeconds)} hint="this session" />
                                <Metric
                                    label="CONFIDENCE"
                                    value={avgConfidence ? `${(avgConfidence * 100).toFixed(0)}%` : "—"}
                                    hint="average"
                                />
                            </div>

                            <div className="pcd-engine">
                                <div>
                                    <span className="pcd-kicker">AI ENGINE</span>
                                    <strong>{status === "active" ? "RUNNING" : "STANDBY"}</strong>
                                </div>
                                <div className="pcd-engine-tech">
                                    <span>YOLO V3</span>
                                    <span>·</span>
                                    <span>ONNX</span>
                                    <span>·</span>
                                    <span>WebGPU</span>
                                </div>
                            </div>
                        </section>
                    </aside>
                </section>
            </main>
        </div>
    );
}

export default App;
