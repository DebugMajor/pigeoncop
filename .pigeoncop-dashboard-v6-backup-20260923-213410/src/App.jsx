import Camera from "./components/Camera";
import Header from "./components/Header";
import ControlPanel from "./components/ControlPanel";
import DetectionLog from "./components/DetectionLog";
import Footer from "./components/Footer";
import StatusPanel from "./components/StatusPanel";
import "./App.css";
import "./sound-selection.css";
import "./dashboard-v4.css";
import "./dashboard-v5.css";
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
    const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
}

function RecentDetections({ detections }) {
    const recent = detections.slice(0, 5);

    return (
        <section className="pcv4-panel pcv4-recent">
            <div className="pcv4-panel-head">
                <div>
                    <span className="pcv4-kicker">ACTIVITY</span>
                    <h2>Recent Detections</h2>
                </div>
                <span className="pcv4-live-session">Live session</span>
            </div>

            {recent.length === 0 ? (
                <div className="pcv4-empty">
                    <div className="pcv4-empty-icon">+</div>
                    <div>
                        <strong>No detections yet</strong>
                        <span>Confirmed events will appear here.</span>
                    </div>
                </div>
            ) : (
                <div className="pcv4-recent-list">
                    {recent.map((detection) => {
                        const isBird = detection.type === "bird";
                        const isHuman = detection.type === "human";
                        const label = isBird
                            ? detection.name || "Pigeon"
                            : isHuman
                                ? "Human"
                                : "Motion";

                        return (
                            <article className="pcv4-recent-item" key={detection.id}>
                                <div className="pcv4-thumb">
                                    {detection.snapshot ? (
                                        <img src={detection.snapshot} alt={`${label} detection`} />
                                    ) : (
                                        <div className="pcv4-thumb-placeholder">
                                            {isBird ? "P" : isHuman ? "H" : "M"}
                                        </div>
                                    )}
                                </div>

                                <div className="pcv4-recent-info">
                                    <strong>{label}</strong>
                                    <span>
                                        {typeof detection.confidence === "number"
                                            ? `${(detection.confidence * 100).toFixed(0)}% confidence`
                                            : "Motion event"}
                                    </span>
                                    <small>{new Date(detection.timestamp).toLocaleTimeString()}</small>
                                </div>

                                {isBird && (
                                    <span className="pcv4-event-badge">
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
            if (testSoundRef.current) {
                testSoundRef.current.pause();
            }

            testSoundRef.current = new Audio(selectedSoundPath);
            testSoundRef.current.preload = "auto";
        }

        testSoundRef.current.currentTime = 0;
        testSoundRef.current.play().catch((error) => {
            console.log("Test sound playback failed:", error);
        });
    };

    return (
        <div className="app-shell pcv4-dashboard">
            <Header status={status} />

            <main className="pcv4-content">
                <header className="pcv4-titlebar">
                    <div>
                        <span className="pcv4-kicker">01 / MONITOR</span>
                        <h1>Live Camera</h1>
                    </div>

                    <div className="pcv4-title-status">
                        <span className={`pcv4-status-dot ${status === "active" ? "active" : ""}`} />
                        <strong>{status === "active" ? "Monitoring Active" : "Standby"}</strong>
                        <span className="pcv4-divider" />
                        <span>{formatDate(now)}</span>
                        <span>{formatClock(now)}</span>
                    </div>
                </header>

                <section className="pcv4-grid">
                    <div className="pcv4-primary">
                        <section className="pcv4-camera-shell">
                            <div className="pcv4-camera-top">
                                <div>
                                    <span className="pcv4-camera-label">CAMERA 1 — MAIN VIEW</span>
                                    <span className="pcv4-camera-sub">
                                        {sourceMode === "test"
                                            ? testVideoFile?.name || "Built-in test environment"
                                            : "Browser camera source"}
                                    </span>
                                </div>
                                <span className="pcv4-live-badge">
                                    <i />
                                    {status === "active" ? "LIVE" : "READY"}
                                </span>
                            </div>

                            <div className="pcv4-camera-body">
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

                            <div className="pcv4-camera-foot">
                                <span><i /> Motion {status === "active" ? "monitoring" : "standby"}</span>
                                <span>AI {status === "active" ? "ACTIVE" : "READY"}</span>
                                <span>ONNX / WebGPU</span>
                            </div>
                        </section>

                        <section id="control-panel" className="pcv4-controls">
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

                        <section className="pcv4-panel pcv4-activity-panel" id="detection-activity">
                            <div className="pcv4-panel-head">
                                <div>
                                    <span className="pcv4-kicker">02 / ACTIVITY</span>
                                    <h2>Detection Activity</h2>
                                </div>
                                <span className="pcv4-count">{detections.length}</span>
                            </div>
                            <DetectionLog detections={detections} />
                        </section>

                        <div className="pcv4-about">
                            <span>Detect • Deter • Protect</span>
                            <p>PigeonCop — real-time AI bird monitoring and deterrence.</p>
                        </div>
                    </div>

                    <aside className="pcv4-side">
                        <RecentDetections detections={detections} />

                        <section className="pcv4-panel pcv4-telemetry">
                            <div className="pcv4-panel-head">
                                <div>
                                    <span className="pcv4-kicker">SYSTEM</span>
                                    <h2>Telemetry</h2>
                                </div>
                            </div>

                            <div className="pcv4-telemetry-grid">
                                <StatusPanel
                                    detections={detections}
                                    status={status}
                                    motionEvents={motionEvents}
                                    deterrentEvents={deterrentEvents}
                                />
                            </div>
                        </section>

                        <section className="pcv4-panel pcv4-session">
                            <div className="pcv4-panel-head">
                                <div>
                                    <span className="pcv4-kicker">SESSION</span>
                                    <h2>Current Run</h2>
                                </div>
                            </div>
                            <div className="pcv4-session-grid">
                                <div><strong>{formatRuntime(sessionSeconds)}</strong><span>MONITORING TIME</span></div>
                                <div><strong>{motionEvents}</strong><span>MOTION EVENTS</span></div>
                                <div><strong>{deterrentEvents}</strong><span>DETERRENTS</span></div>
                                <div><strong>{birdCountSafe(detections)}</strong><span>BIRDS</span></div>
                            </div>
                        </section>
                    </aside>
                </section>
            </main>

            <Footer />
        </div>
    );
}

function birdCountSafe(detections) {
    return detections.filter((detection) => detection.type === "bird").length;
}

export default App;
