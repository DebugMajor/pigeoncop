import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlay,
    faStop,
    faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";

function ControlPanel({ status, setStatus, onTestDetection }) {
    return (
        <section className="control-panel">
            <div className="control-copy">
                <span className="section-kicker">CONTROL</span>
                <h2>Monitoring Controls</h2>
                <p>Manage the live camera session and deterrent test.</p>
            </div>

            <div className="control-actions">
                <button
                    type="button"
                    className="action-button action-primary"
                    disabled={status === "active" || status === "loading"}
                    onClick={() => setStatus("loading")}
                >
                    <FontAwesomeIcon icon={faPlay} />
                    <span>Start Monitoring</span>
                </button>

                <button
                    type="button"
                    className="action-button action-secondary"
                    disabled={status === "offline" || status === "error"}
                    onClick={() => setStatus("stopping")}
                >
                    <FontAwesomeIcon icon={faStop} />
                    <span>Stop</span>
                </button>

                <button
                    type="button"
                    className="action-button action-tertiary"
                >
                    <FontAwesomeIcon icon={faVolumeHigh} />
                    <span>Test Sound</span>
                </button>

                <button
                    type="button"
                    className="action-button action-tertiary"
                    onClick={onTestDetection}
                >
                    <span>Test Detection</span>
                </button>
            </div>
        </section>
    );
}

export default ControlPanel;