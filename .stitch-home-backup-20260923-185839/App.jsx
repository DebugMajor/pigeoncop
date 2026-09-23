import Camera from "./components/Camera";
import HomePage from "./components/HomePage";
import Header from "./components/Header";
import ControlPanel from "./components/ControlPanel";
import DetectionLog from "./components/DetectionLog";
import Footer from "./components/Footer";
import StatusPanel from "./components/StatusPanel";
import "./App.css";
import "./sound-selection.css";
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

function App() {
    const [pigeonCopView, setPigeonCopView] = useState("home");
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
    const testSoundRef = useRef(null);

    const selectedSoundPath = deterrentSounds[deterrentSound].path;
    const selectedSoundLabel = deterrentSounds[deterrentSound].label;

    useEffect(() => {
        if (status === "active" && sourceMode === "test") {
            setTestVideoPlaying(true);
        }
        if (status !== "active") {
            setTestVideoPlaying(false);
        }
    }, [status, sourceMode]);

    useEffect(() => {
    if (pigeonCopView === "home") {
        return <HomePage onTestNow={() => setPigeonCopView("monitor")} />;
    }

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
        if (!testSoundRef.current || testSoundRef.current.src !== new URL(selectedSoundPath, window.location.href).href) {
            if (testSoundRef.current) testSoundRef.current.pause();
            testSoundRef.current = new Audio(selectedSoundPath);
            testSoundRef.current.preload = "auto";
        }

        testSoundRef.current.currentTime = 0;
        testSoundRef.current.play().catch((error) => {
            console.log("Test sound playback failed:", error);
        });
    };

    return (
        <div className="app-shell">
            <Header status={status} />
            <main className="dashboard">
                <section className="intro-panel">
                    <div className="intro-copy">
                        <div className="eyebrow"><span className="eyebrow-line" />REAL-TIME AI MONITORING</div>
                        <h1>Detect. Deter. <span>Protect.</span></h1>
                        <p>Local computer vision for intelligent bird monitoring, built to run directly in your browser.</p>
                    </div>
                    <div className={`session-state ${status === "active" ? "is-active" : ""}`}>
                        <span className="session-dot" />
                        <div><span className="session-label">SYSTEM</span><strong>{status === "active" ? "ACTIVE" : "READY"}</strong></div>
                    </div>
                </section>

                <section className="dashboard-grid">
                    <div className="primary-column">
                        <div className="section-title-row">
                            <div><span className="section-kicker">01 / MONITOR</span><h2>Live Camera</h2></div>
                            <span className="section-state"><span className="session-dot" />{status === "active" ? "Monitoring active" : "Standby"}</span>
                        </div>

                        <div className="camera-frame">
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

                        <section className="activity-panel">
                            <div className="section-title-row">
                                <div><span className="section-kicker">02 / ACTIVITY</span><h2>Detection Events</h2></div>
                                <span className="event-count">{detections.length}</span>
                            </div>
                            <DetectionLog detections={detections} />
                        </section>
                    </div>

                    <aside className="metrics-column">
                        <div className="section-title-row side-heading"><div><span className="section-kicker">SYSTEM</span><h2>Telemetry</h2></div></div>
                        <div className="metrics-stack">
                            <StatusPanel detections={detections} status={status} motionEvents={motionEvents} deterrentEvents={deterrentEvents} />
                        </div>
                    </aside>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default App;
