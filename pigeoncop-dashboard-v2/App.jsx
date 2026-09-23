import Camera from "./components/Camera";
import ControlPanel from "./components/ControlPanel";
import DetectionLog from "./components/DetectionLog";
import Footer from "./components/Footer";
import StatusPanel from "./components/StatusPanel";
import "./App.css";
import "./sound-selection.css";
import "./dashboard-v2.css";
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
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatRuntime(seconds) {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
}

function RecentDetections({ detections }) {
    const recent = detections.slice(0, 5);

    return (
        <section className="pcv2-panel pcv2-recent-panel">
            <div className="pcv2-panel-head">
                <div>
                    <span className="pcv2-kicker">ACTIVITY</span>
                    <h2>Recent Detections</h2>
                </div>
                <span className="pcv2-view-link">Live session</span>
            </div>

            {recent.length === 0 ? (
                <div className="pcv2-recent-empty">
                    <div className="pcv2-empty-icon">+</div>
                    <div>
                        <strong>No detections yet</strong>
                        <span>Confirmed events will appear here.</span>
                    </div>
                </div>
            ) : (
                <div className="pcv2-recent-list">
                    {recent.map((detection) => {
                        const isBird = detection.type === "bird";
                        const isHuman = detection.type === "human";
                        const label = isBird
                            ? detection.name || "Pigeon"
                            : isHuman
                                ? "Human"
                                : "Motion";

                        return (
                            <article className="pcv2-recent-item" key={detection.id}>
                                <div className="pcv2-thumb">
                                    {detection.snapshot ? (
                                        <img src={detection.snapshot} alt={`${label} detection`} />
                                    ) : (
                                        <div className="pcv2-thumb-placeholder">{isBird ? "P" : isHuman ? "H" : "M"}</div>
                                    )}
                                </div>

                                <div className="pcv2-recent-main">
                                    <strong>{label}</strong>
                                    <span>
                                        {typeof detection.confidence === "number"
                                            ? `${(detection.confidence * 100).toFixed(0)}% confidence`
                                            : isBird && detection.deterrentStatus
                                                ? detection.deterrentStatus
                                                : "Motion event"}
                                    </span>
                                    <small>{new Date(detection.timestamp).toLocaleTimeString()}</small>
                                </div>

                                {isBird && (
                                    <span className="pcv2-event-badge">
                                        {detection.deterrentStatus || "Triggered"}
                                    </span>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
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
    const [resetTrigger, setResetTrigger] = useState(0);
    const [playbackCommand, setPlaybackCommand] = useState(0);
    const [playbackAction, setPlaybackAction] = useState("play");
    const [testVideoPlaying, setTestVideoPlaying] = useState(false);
    const [now, setNow] = useState(new Date());
    const [sessionSeconds, setSessionSeconds] = useState(0);
    const sessionStartedRef = useRef(null);
    const testSoundRef = useRef(null);

    const selectedSoundPath = deterrentSounds[deterrentSound].path;
    const selectedSoundLabel = deterrentSounds[deterrentSound].label;

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (status !== "active") {
            sessionStartedRef.current = null;
            setSessionSeconds(0);
            setTestVideoPlaying(false);
            return undefined;
        }

        sessionStartedRef.current = Date.now();
        const interval = setInterval(() => {
            if (sessionStartedRef.current) {
                setSessionSeconds(
                    Math.floor((Date.now() - sessionStartedRef.current) / 1000)
                );
            }
        }, 1000);

        if (sourceMode === "test") {
            setTestVideoPlaying(true);
        }

        return () => clearInterval(interval);
    }, [status, sourceMode]);

    useEffect(() => {
        return () => {
            if (testSoundRef.current) {
                testSoundRef.current.pause();
                testSoundRef.current = null;
            }
        };
    }, []);

    const handleDetection = (detection) => {
        setDetections((prev) => [detection, ...prev].slice(0, 20));
    };

    const handleMotion = () => setMotionEvents((prev) => prev + 1);
    const handleDeterrent = () => setDeterrentEvents((prev) => prev + 1);

    const handleResetTest = () => {
        setDetections([]);
        setMotionEvents(0);
        setDeterrentEvents(0);
        setTestVideoPlaying(true);
        setPlaybackAction("play");
        setResetTrigger((prev) => prev + 1);
    };

    const handleTogglePlayback = () => {
        const nextPlaying = !testVideoPlaying;
        setTestVideoPlaying(nextPlaying);
        setPlaybackAction(nextPlaying ? "play" : "pause");
        setPlaybackCommand((prev) => prev + 1);
    };

    const handleTestDetection = () => {
        if (
            !testSoundRef.current ||
            testSoundRef.current.src !==
                new URL(selectedSoundPath, window.location.href).href
        ) {
            if (testSoundRef.current) testSoundRef.current.pause();
            testSoundRef.current = new Audio(selectedSoundPath);
            testSoundRef.current.preload = "auto";
        }

        testSoundRef.current.currentTime = 0;
        testSoundRef.current.play().catch((error) => {
            console.log("Test sound playback failed:", error);
        });
    };

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const birdCount = detections.filter((detection) => detection.type === "bird").length;
    const averageConfidenceItems = detections.filter(
        (detection) => typeof detection.confidence === "number"
    );
    const averageConfidence = averageConfidenceItems.length
        ? averageConfidenceItems.reduce((sum, detection) => sum + detection.confidence, 0) /
          averageConfidenceItems.length
        : 0;

    return (
        <div className="app-shell pcv2-app">
            <aside className="pcv2-sidebar">
                <button className="pcv2-side-brand" onClick={() => window.location.assign("/")}>
                    <img src="/logo-wordmark.png" alt="PigeonCop" />
                </button>

                <div className="pcv2-side-nav">
                    <button className="pcv2-nav-item active" onClick={() => scrollTo("live-camera")}>
                        <span className="pcv2-nav-icon">●</span>
                        <span>Live Camera</span>
                    </button>
                    <button className="pcv2-nav-item" onClick={() => scrollTo("detection-activity")}>
                        <span className="pcv2-nav-icon">≡</span>
                        <span>Detections</span>
                    </button>
                    <button className="pcv2-nav-item" onClick={() => scrollTo("statistics")}>
                        <span className="pcv2-nav-icon">▥</span>
                        <span>Statistics</span>
                    </button>
                    <button className="pcv2-nav-item" onClick={() => scrollTo("control-panel")}>
                        <span className="pcv2-nav-icon">⚙</span>
                        <span>Settings</span>
                    </button>
                    <button className="pcv2-nav-item" onClick={() => scrollTo("about")}>
                        <span className="pcv2-nav-icon">i</span>
                        <span>About</span>
                    </button>
                </div>

                <div className="pcv2-side-card">
                    <div className="pcv2-side-shield">✓</div>
                    <span>PROTECTING</span>
                    <strong>WHAT MATTERS</strong>
                    <p>AI-powered bird detection for cleaner, quieter spaces.</p>
                </div>
            </aside>

            <div className="pcv2-main">
                <header className="pcv2-topbar">
                    <div className="pcv2-topbar-left">
                        <h1>Live Camera</h1>
                        <span className={status === "active" ? "pcv2-online active" : "pcv2-online"}>
                            <i />
                            {status === "active" ? "Monitoring Active" : "Standby"}
                        </span>
                    </div>

                    <div className="pcv2-topbar-right">
                        <span>{formatDate(now)}</span>
                        <span>{formatClock(now)}</span>
                        <span className="pcv2-system-online">
                            <i />
                            {status === "active" ? "System Online" : "System Ready"}
                        </span>
                    </div>
                </header>

                <main className="pcv2-content">
                    <section id="live-camera" className="pcv2-main-grid">
                        <div className="pcv2-camera-column">
                            <div className="pcv2-camera-shell">
                                <div className="pcv2-camera-label">CAMERA 1 — MAIN VIEW</div>
                                <div className="pcv2-live-badge">
                                    <i />
                                    {status === "active" ? "LIVE" : "READY"}
                                </div>

                                <div className="pcv2-camera-content">
                                    <Camera
                                        status={status}
                                        setStatus={setStatus}
                                        onDetection={handleDetection}
                                        onMotion={handleMotion}
                                        onDeterrent={handleDeterrent}
                                        resetTrigger={resetTrigger}
                                        sourceMode={sourceMode}
                                        playbackCommand={playbackCommand}
                                        playbackAction={playbackAction}
                                        testVideoFile={testVideoFile}
                                        deterrentSoundPath={selectedSoundPath}
                                    />
                                </div>
                            </div>

                            <div className="pcv2-action-row" id="control-panel">
                                <button className="pcv2-action pcv2-action-danger" onClick={handleTestDetection}>
                                    <span className="pcv2-action-icon">◉</span>
                                    <span><strong>Trigger Deterrent</strong><small>Manual activation</small></span>
                                </button>

                                <button
                                    className="pcv2-action"
                                    onClick={() => scrollTo("detection-activity")}
                                >
                                    <span className="pcv2-action-icon">▣</span>
                                    <span><strong>View Activity</strong><small>Session evidence</small></span>
                                </button>

                                {sourceMode === "test" ? (
                                    <button
                                        className="pcv2-action"
                                        onClick={handleTogglePlayback}
                                        disabled={status !== "active"}
                                    >
                                        <span className="pcv2-action-icon">{testVideoPlaying ? "Ⅱ" : "▶"}</span>
                                        <span><strong>{testVideoPlaying ? "Pause Detection" : "Resume Detection"}</strong><small>Test video control</small></span>
                                    </button>
                                ) : (
                                    <button
                                        className="pcv2-action"
                                        onClick={() => setStatus(status === "active" ? "stopping" : "loading")}
                                    >
                                        <span className="pcv2-action-icon">{status === "active" ? "Ⅱ" : "▶"}</span>
                                        <span><strong>{status === "active" ? "Pause Detection" : "Start Detection"}</strong><small>Camera session</small></span>
                                    </button>
                                )}

                                <button className="pcv2-action" onClick={() => scrollTo("control-panel")}>
                                    <span className="pcv2-action-icon">⚙</span>
                                    <span><strong>Settings</strong><small>Source & deterrent</small></span>
                                </button>
                            </div>

                            <section id="detection-activity" className="pcv2-panel pcv2-activity-panel">
                                <div className="pcv2-panel-head">
                                    <div>
                                        <span className="pcv2-kicker">SESSION</span>
                                        <h2>Detection Activity</h2>
                                    </div>
                                    <span className="pcv2-count">{detections.length}</span>
                                </div>
                                <DetectionLog detections={detections} />
                            </section>

                            <section id="statistics" className="pcv2-stat-grid">
                                <div className="pcv2-stat-card">
                                    <span>Pigeons Detected</span>
                                    <strong>{birdCount}</strong>
                                    <small>This session</small>
                                </div>
                                <div className="pcv2-stat-card">
                                    <span>Deterrents Triggered</span>
                                    <strong>{deterrentEvents}</strong>
                                    <small>Audio activations</small>
                                </div>
                                <div className="pcv2-stat-card">
                                    <span>Monitoring Time</span>
                                    <strong>{formatRuntime(sessionSeconds)}</strong>
                                    <small>Current session</small>
                                </div>
                                <div className="pcv2-stat-card pcv2-stat-active">
                                    <span>System Status</span>
                                    <strong>{status === "active" ? "Active" : "Ready"}</strong>
                                    <small>
                                        Avg. confidence: {averageConfidence ? `${(averageConfidence * 100).toFixed(1)}%` : "—"}
                                    </small>
                                </div>
                            </section>

                            <div id="about" className="pcv2-about">
                                <span>Detect • Deter • Protect</span>
                                <p>PigeonCop — real-time AI bird monitoring and deterrence.</p>
                            </div>
                        </div>

                        <aside className="pcv2-right-column">
                            <RecentDetections detections={detections} />

                            <div className="pcv2-panel pcv2-system-panel">
                                <div className="pcv2-panel-head">
                                    <div>
                                        <span className="pcv2-kicker">SYSTEM</span>
                                        <h2>Telemetry</h2>
                                    </div>
                                </div>
                                <div className="pcv2-status-stack">
                                    <StatusPanel
                                        detections={detections}
                                        status={status}
                                        motionEvents={motionEvents}
                                        deterrentEvents={deterrentEvents}
                                    />
                                </div>
                            </div>
                        </aside>
                    </section>

                    <section className="pcv2-controls-wrap">
                        <ControlPanel
                            status={status}
                            setStatus={setStatus}
                            onTestDetection={handleTestDetection}
                            sourceMode={sourceMode}
                            setSourceMode={setSourceMode}
                            testVideoFile={testVideoFile}
                            onVideoSelect={setTestVideoFile}
                            onResetTest={handleResetTest}
                            onTogglePlayback={handleTogglePlayback}
                            testVideoPlaying={testVideoPlaying}
                            deterrentSound={deterrentSound}
                            deterrentSounds={deterrentSounds}
                            setDeterrentSound={setDeterrentSound}
                            selectedSoundLabel={selectedSoundLabel}
                        />
                    </section>
                </main>

                <Footer />
            </div>
        </div>
    );
}

export default App;
