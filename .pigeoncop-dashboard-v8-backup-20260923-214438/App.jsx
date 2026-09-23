import Camera from "./components/Camera";
import Header from "./components/Header";
import ControlPanel from "./components/ControlPanel";
import DetectionLog from "./components/DetectionLog";
import Footer from "./components/Footer";
import "./App.css";
import "./sound-selection.css";
import "./dashboard-v6.css";
import { useEffect, useRef, useState } from "react";

const deterrentSounds = {
    "soothing-rock": { label: "Soothing Rock", path: "/sounds/motion-feedback-soothing-rock.wav" },
    "loud-alert": { label: "Loud Alert", path: "/sounds/deterrent-loud-alert.wav" },
    "high-frequency": { label: "High Frequency", path: "/sounds/deterrent-high-frequency.wav" },
    "high-frequency-pulse": { label: "High Frequency Pulse", path: "/sounds/deterrent-high-frequency-pulse.wav" },
    gunshot: { label: "Gunshot", path: "/sounds/deterrent-gunshot.wav" },
};

function formatClock(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function RecentDetections({ detections }) {
    const recent = detections.slice(0, 3);

    return (
        <section className="pcv6-panel pcv6-recent">
            <div className="pcv6-panel-head">
                <div>
                    <span className="pcv6-kicker">ACTIVITY</span>
                    <h2>Recent Detections</h2>
                </div>
                <span className="pcv6-live-session">Live session</span>
            </div>

            {recent.length === 0 ? (
                <div className="pcv6-empty">
                    <div className="pcv6-empty-icon">+</div>
                    <div>
                        <strong>No detections yet</strong>
                        <span>Confirmed events will appear here.</span>
                    </div>
                </div>
            ) : (
                <div className="pcv6-recent-list">
                    {recent.map((detection) => {
                        const isBird = detection.type === "bird";
                        const label = isBird ? detection.name || "Pigeon" : detection.type === "human" ? "Human" : "Motion";
                        return (
                            <article className="pcv6-recent-item" key={detection.id}>
                                <div className="pcv6-thumb">
                                    {detection.snapshot ? (
                                        <img src={detection.snapshot} alt={`${label} detection`} />
                                    ) : (
                                        <div>{isBird ? "P" : detection.type === "human" ? "H" : "M"}</div>
                                    )}
                                </div>
                                <div className="pcv6-recent-info">
                                    <strong>{label}</strong>
                                    <span>
                                        {typeof detection.confidence === "number"
                                            ? `${(detection.confidence * 100).toFixed(0)}% confidence`
                                            : "Motion event"}
                                    </span>
                                    <small>{new Date(detection.timestamp).toLocaleTimeString()}</small>
                                </div>
                                {isBird && (
                                    <span className="pcv6-event-badge">
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

function Metric({ label, value, sub }) {
    return (
        <div className="pcv6-metric">
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{sub}</small>
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
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (status !== "active") {
            sessionStartedRef.current = null;
            setSessionSeconds(0);
            setTestVideoPlaying(false);
            return undefined;
        }

        sessionStartedRef.current = Date.now();
        const timer = setInterval(() => {
            if (sessionStartedRef.current) {
                setSessionSeconds(Math.floor((Date.now() - sessionStartedRef.current) / 1000));
            }
        }, 1000);

        if (sourceMode === "test") setTestVideoPlaying(true);
        return () => clearInterval(timer);
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
        const next = !testVideoPlaying;
        setTestVideoPlaying(next);
        setPlaybackAction(next ? "play" : "pause");
        setPlaybackCommand((prev) => prev + 1);
    };

    const handleTestDetection = () => {
        if (
            !testSoundRef.current ||
            testSoundRef.current.src !== new URL(selectedSoundPath, window.location.href).href
        ) {
            if (testSoundRef.current) testSoundRef.current.pause();
            testSoundRef.current = new Audio(selectedSoundPath);
            testSoundRef.current.preload = "auto";
            testSoundRef.current.volume = 1;
        }

        testSoundRef.current.currentTime = 0;
        testSoundRef.current.play().catch((error) => console.log("Test sound playback failed:", error));
    };

    const birdCount = detections.filter((d) => d.type === "bird").length;
    const aiActive = status === "active";

    return (
        <div className="app-shell pcv6-dashboard">
            <Header status={status} />

            <main className="pcv6-content">
                <header className="pcv6-titlebar">
                    <div>
                        <span className="pcv6-kicker">01 / MONITOR</span>
                        <h1>{sourceMode === "test" ? "Test Video" : "Live Camera"}</h1>
                    </div>

                    <div className="pcv6-title-status">
                        <span className={`pcv6-status-dot ${aiActive ? "active" : ""}`} />
                        <strong>{aiActive ? "Monitoring Active" : "Standby"}</strong>
                        <span className="pcv6-divider" />
                        <span className="pcv6-ai-pill">
                            <i />
                            AI {aiActive ? "ACTIVE" : "READY"}
                        </span>
                        <span>{formatClock(now)}</span>
                    </div>
                </header>

                <section className="pcv6-grid">
                    <div className="pcv6-primary">
                        <section id="live-camera" className="pcv6-camera-shell">
                            <div className="pcv6-camera-top">
                                <div>
                                    <span className="pcv6-camera-label">CAMERA 1 — MAIN VIEW</span>
                                    <span className="pcv6-camera-sub">
                                        {sourceMode === "test"
                                            ? testVideoFile?.name || "Built-in test environment"
                                            : "Browser camera source"}
                                    </span>
                                </div>
                                <span className="pcv6-live-badge"><i />{aiActive ? "LIVE" : "READY"}</span>
                            </div>

                            <div className="pcv6-camera-body">
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

                            <div className="pcv6-camera-foot">
                                <span><i /> Motion {aiActive ? "monitoring" : "standby"}</span>
                                <span>AI {aiActive ? "ACTIVE" : "READY"}</span>
                                <span>V3 / ONNX · WEBGPU</span>
                            </div>
                        </section>

                        <section id="control-panel" className="pcv6-controls">
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

                        <section id="detection-activity" className="pcv6-panel pcv6-activity">
                            <div className="pcv6-panel-head">
                                <div>
                                    <span className="pcv6-kicker">02 / ACTIVITY</span>
                                    <h2>Detection Activity</h2>
                                </div>
                                <span className="pcv6-count">{detections.length}</span>
                            </div>
                            <DetectionLog detections={detections} />
                        </section>
                    </div>

                    <aside className="pcv6-side">
                        <RecentDetections detections={detections} />

                        <section className="pcv6-panel pcv6-session-panel">
                            <div className="pcv6-panel-head">
                                <div>
                                    <span className="pcv6-kicker">SYSTEM</span>
                                    <h2>Session Status</h2>
                                </div>
                                <span className="pcv6-ready-pill"><i />{aiActive ? "ONLINE" : "READY"}</span>
                            </div>

                            <div className="pcv6-metric-grid">
                                <Metric label="BIRDS" value={birdCount} sub="confirmed" />
                                <Metric label="DETERRENTS" value={deterrentEvents} sub="audio activations" />
                                <Metric label="MOTION" value={motionEvents} sub="events" />
                                <Metric label="RUNTIME" value={formatRuntime(sessionSeconds)} sub="this session" />
                            </div>

                            <div className="pcv6-engine-row">
                                <span><i /> AI ENGINE</span>
                                <strong>{aiActive ? "RUNNING" : "STANDBY"}</strong>
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

function formatRuntime(seconds) {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
}

export default App;
