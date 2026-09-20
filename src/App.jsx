import Camera from "./components/Camera";
import Header from "./components/Header";
import ControlPanel from "./components/ControlPanel";
import DetectionLog from "./components/DetectionLog";
import Footer from "./components/Footer";
import StatusPanel from "./components/StatusPanel";
import "./App.css";
import { useState } from "react";

function App() {
    const [status, setStatus] = useState("offline");
    const [detections, setDetections] = useState([]);
    const [testTrigger, setTestTrigger] = useState(0);

    const handleDetection = (detection) => {
        console.log("APP EVENT RECEIVED:", detection);

        setDetections((prevDetections) =>
            [detection, ...prevDetections].slice(0, 20)
        );
    };

    const handleTestDetection = () => {
        setTestTrigger((prev) => prev + 1);
    };

    return (
        <div className="app-shell">
            <Header status={status} />

            <main className="dashboard">
                <section className="intro-panel">
                    <div className="intro-copy">
                        <div className="eyebrow">
                            <span className="eyebrow-line" />
                            REAL-TIME AI MONITORING
                        </div>

                        <h1>
                            Detect. Deter. <span>Protect.</span>
                        </h1>

                        <p>
                            Local computer vision for intelligent bird
                            monitoring, built to run directly in your browser.
                        </p>
                    </div>

                    <div
                        className={`session-state ${status === "active" ? "is-active" : ""
                            }`}
                    >
                        <span className="session-dot" />

                        <div>
                            <span className="session-label">SYSTEM</span>

                            <strong>
                                {status === "active" ? "ACTIVE" : "READY"}
                            </strong>
                        </div>
                    </div>
                </section>

                <section className="dashboard-grid">
                    <div className="primary-column">
                        <div className="section-title-row">
                            <div>
                                <span className="section-kicker">
                                    01 / MONITOR
                                </span>

                                <h2>Live Camera</h2>
                            </div>

                            <span className="section-state">
                                <span className="session-dot" />

                                {status === "active"
                                    ? "Monitoring active"
                                    : "Standby"}
                            </span>
                        </div>

                        <div className="camera-frame">
                            <Camera
                                status={status}
                                setStatus={setStatus}
                                onDetection={handleDetection}
                                testTrigger={testTrigger}
                            />
                        </div>

                        <ControlPanel
                            status={status}
                            setStatus={setStatus}
                            onTestDetection={handleTestDetection}
                        />

                        <section className="activity-panel">
                            <div className="section-title-row">
                                <div>
                                    <span className="section-kicker">
                                        02 / ACTIVITY
                                    </span>

                                    <h2>Detection Events</h2>
                                </div>

                                <span className="event-count">
                                    {detections.length}
                                </span>
                            </div>

                            <DetectionLog detections={detections} />
                        </section>
                    </div>

                    <aside className="metrics-column">
                        <div className="section-title-row side-heading">
                            <div>
                                <span className="section-kicker">
                                    SYSTEM
                                </span>

                                <h2>Telemetry</h2>
                            </div>
                        </div>

                        <div className="metrics-stack">
                            <StatusPanel
                                detections={detections}
                                status={status}
                            />
                        </div>
                    </aside>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default App;