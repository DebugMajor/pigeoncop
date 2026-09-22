import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlay,
    faStop,
    faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";

function ControlPanel({
    status,
    setStatus,
    onTestDetection,
    sourceMode,
    setSourceMode,
    onResetTest
}) {
    return (
        <section className="control-panel">
            <div className="control-copy">
                <span className="section-kicker">CONTROL</span>
                <h2>Monitoring Controls</h2>
                <p>Manage the live camera session and deterrent test.</p>
            </div>

            <div className="source-selector">
                <span className="section-kicker">SOURCE</span>

                <div className="source-options">
                    <button
                        type="button"
                        className={`source-option ${sourceMode === "live" ? "active" : ""
                            }`}
                        disabled={
                            status === "active" || status === "loading"
                        }
                        onClick={() => setSourceMode("live")}
                    >
                        Live Camera
                    </button>

                    <button
                        type="button"
                        className={`source-option ${sourceMode === "test" ? "active" : ""
                            }`}
                        disabled={
                            status === "active" || status === "loading"
                        }
                        onClick={() => setSourceMode("test")}
                    >
                        Test Video
                    </button>
                </div>
            </div>

            <div className="control-actions">
                <button
                    type="button"
                    className="action-button action-primary"
                    disabled={
                        status === "active" || status === "loading"
                    }
                    onClick={() => setStatus("loading")}
                >
                    <FontAwesomeIcon icon={faPlay} />
                    <span>Start Monitoring</span>
                </button>

                <button
                    type="button"
                    className="action-button action-secondary"
                    disabled={
                        status === "offline" || status === "error"
                    }
                    onClick={() => setStatus("stopping")}
                >
                    <FontAwesomeIcon icon={faStop} />
                    <span>Stop</span>
                </button>

                <button
                    type="button"
                    className="action-button action-tertiary"
                    onClick={onTestDetection}
                >
                    <FontAwesomeIcon icon={faVolumeHigh} />
                    <span>Test Sound</span>
                </button>

                {sourceMode === "test" && (
                    <button
                        type="button"
                        className="action-button action-secondary"
                        onClick={onResetTest}
                        disabled={status !== "active"}
                    >
                        <span>Reset Test</span>
                    </button>
                )}


            </div>
        </section>
    );
}

export default ControlPanel;