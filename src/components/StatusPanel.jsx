import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCrow,
    faVolumeHigh,
    faStopwatch,
    faMicrochip,
    faPersonWalking,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

function StatusPanel({ detections, status, motionEvents }) {
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
        const minutes = String(
            Math.floor((seconds % 3600) / 60)
        ).padStart(2, "0");
        const remaining = String(seconds % 60).padStart(2, "0");

        return `${hours}:${minutes}:${remaining}`;
    };

    const birdCount = detections.filter(
        (detection) => detection.type === "bird"
    ).length;

    const deterrentCount = detections.filter(
        (detection) => detection.deterrentStatus === "Triggered"
    ).length;

    const confidenceDetections = detections.filter(
        (detection) => typeof detection.confidence === "number"
    );

    const averageConfidence =
        confidenceDetections.length > 0
            ? confidenceDetections.reduce(
                (sum, detection) => sum + detection.confidence,
                0
            ) / confidenceDetections.length
            : 0;

    const lastDetection = detections[0];

    const lastDetectionLabel = lastDetection
        ? lastDetection.type === "bird"
            ? lastDetection.name || "Pigeon"
            : lastDetection.type === "human"
                ? "Human"
                : "Motion"
        : "None";

    const lastDetectionTime = lastDetection
        ? new Date(lastDetection.timestamp).toLocaleTimeString()
        : "—";

    return (
        <>
            <article className="telemetry-card telemetry-featured">
                <div className="telemetry-top">
                    <div className="telemetry-icon">
                        <FontAwesomeIcon icon={faCrow} />
                    </div>

                    <span className="telemetry-label">
                        BIRDS THIS SESSION
                    </span>
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

                    <span className="telemetry-label">
                        SOUND SYSTEM
                    </span>
                </div>

                <div className="telemetry-value">{deterrentCount}</div>

                <p>
                    {deterrentCount
                        ? "Deterrent triggered"
                        : "No deterrents triggered yet"}
                </p>
            </article>

            <article className="telemetry-card">
                <div className="telemetry-top">
                    <div className="telemetry-icon">
                        <FontAwesomeIcon icon={faPersonWalking} />
                    </div>

                    <span className="telemetry-label">
                        MOTION EVENTS
                    </span>
                </div>

                <div className="telemetry-value">{motionEvents}</div>

                <p>
                    {motionEvents
                        ? "Motion events detected"
                        : "No motion events yet"}
                </p>
            </article>

            <article className="telemetry-card">
                <div className="telemetry-top">
                    <div className="telemetry-icon">
                        <FontAwesomeIcon icon={faStopwatch} />
                    </div>

                    <span className="telemetry-label">
                        RUNTIME
                    </span>
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

                    <span className="telemetry-label">
                        AI ENGINE
                    </span>
                </div>

                <div
                    className={`telemetry-word ${status === "active" ? "live" : ""
                        }`}
                >
                    {status === "active" ? "RUNNING" : "STANDBY"}
                </div>

                <p>
                    YOLO + WebGPU inference
                    <br />
                    Avg. confidence:{" "}
                    {averageConfidence
                        ? `${(averageConfidence * 100).toFixed(1)}%`
                        : "—"}
                    <br />
                    Last detection: {lastDetectionLabel} · {lastDetectionTime}
                </p>
            </article>
        </>
    );
}

export default StatusPanel;