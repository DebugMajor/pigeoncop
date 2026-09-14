import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCrow,
    faVolumeHigh,
    faStopwatch,
    faMicrochip,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

function StatusPanel({ detections, status }) {
    const [runtime, setRuntime] = useState(0);

    useEffect(() => {
        if (status !== "active") {
            setRuntime(0);
            return undefined;
        }

        const startedAt = Date.now();

        const interval = setInterval(() => {
            setRuntime(Math.floor((Date.now() - startedAt) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [status]);

    const formatRuntime = (seconds) => {
        const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
        const remaining = String(seconds % 60).padStart(2, "0");

        return `${hours}:${minutes}:${remaining}`;
    };

    const birdCount = detections.filter(
        (detection) => detection.type === "bird"
    ).length;

    return (
        <>
            <article className="telemetry-card telemetry-featured">
                <div className="telemetry-top">
                    <div className="telemetry-icon">
                        <FontAwesomeIcon icon={faCrow} />
                    </div>

                    <span className="telemetry-label">BIRDS TODAY</span>
                </div>

                <div className="telemetry-value">{birdCount}</div>

                <p>
                    {birdCount
                        ? "Confirmed bird events"
                        : "No confirmed bird events yet"}
                </p>

                <div className="telemetry-ring" />
            </article>

            <article className="telemetry-card">
                <div className="telemetry-top">
                    <div className="telemetry-icon">
                        <FontAwesomeIcon icon={faVolumeHigh} />
                    </div>

                    <span className="telemetry-label">SOUND SYSTEM</span>
                </div>

                <div className="telemetry-word">READY</div>
                <p>Deterrent controls available</p>
            </article>

            <article className="telemetry-card">
                <div className="telemetry-top">
                    <div className="telemetry-icon">
                        <FontAwesomeIcon icon={faStopwatch} />
                    </div>

                    <span className="telemetry-label">RUNTIME</span>
                </div>

                <div className="telemetry-word telemetry-time">
                    {formatRuntime(runtime)}
                </div>

                <p>Current monitoring session</p>
            </article>

            <article className="telemetry-card">
                <div className="telemetry-top">
                    <div className="telemetry-icon">
                        <FontAwesomeIcon icon={faMicrochip} />
                    </div>

                    <span className="telemetry-label">AI ENGINE</span>
                </div>

                <div className={`telemetry-word ${status === "active" ? "live" : ""}`}>
                    {status === "active" ? "RUNNING" : "STANDBY"}
                </div>

                <p>YOLO + WebGPU inference</p>
            </article>
        </>
    );
}

export default StatusPanel;