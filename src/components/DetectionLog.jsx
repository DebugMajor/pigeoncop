function DetectionLog({ detections }) {
    return (
        <div className="logs-container">
            {detections.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-mark">+</div>

                    <div>
                        <h3>No detection events</h3>
                        <p>Monitoring activity will appear here.</p>
                    </div>
                </div>
            ) : (
                <div className="log-list">
                    {detections.map((detection) => {
                        const isBird = detection.type === "bird";
                        const isHuman = detection.type === "human";
                        const isTest = detection.testMode === true;

                        return (
                            <article
                                className="log-row"
                                key={detection.id}
                            >
                                <span className="log-dot" />

                                <div className="log-main">
                                    <strong>
                                        {isBird
                                            ? "Bird Detected"
                                            : isHuman
                                                ? "Human Detected"
                                                : "Motion Detected"}
                                    </strong>

                                    <span>
                                        {new Date(
                                            detection.timestamp
                                        ).toLocaleTimeString()}
                                    </span>
                                </div>

                                <div className="log-detail">
                                    {isBird ? (
                                        <>
                                            <div>
                                                <span>
                                                    {detection.name ||
                                                        "Pigeon"}

                                                    {isTest && (
                                                        <small
                                                            style={{
                                                                marginLeft:
                                                                    "8px",
                                                                opacity: 0.6,
                                                            }}
                                                        >
                                                            TEST
                                                        </small>
                                                    )}
                                                </span>
                                                {detection.snapshot && (
                                                    <div className="detection-snapshot">
                                                        <img
                                                            src={detection.snapshot}
                                                            alt="Bird detection"
                                                        />
                                                    </div>
                                                )}

                                                <div className="detection-meta">
                                                    {detection.snapshot && (
                                                        <span className="detection-meta-item">
                                                            <strong>Captured</strong>
                                                            <span className="meta-status">✓</span>
                                                        </span>
                                                    )}

                                                    <span className="detection-meta-item">
                                                        <strong>Deterrent</strong>
                                                        <span className="meta-status">
                                                            {detection.deterrentStatus || "Triggered"}
                                                        </span>
                                                    </span>
                                                </div>

                                            </div>

                                            <strong>
                                                {typeof detection.confidence ===
                                                    "number"
                                                    ? `${(
                                                        detection.confidence *
                                                        100
                                                    ).toFixed(0)}%`
                                                    : "—"}
                                            </strong>
                                        </>
                                    ) : isHuman ? (
                                        <>
                                            <span>Human</span>

                                            <strong>
                                                {typeof detection.confidence ===
                                                    "number"
                                                    ? `${(
                                                        detection.confidence *
                                                        100
                                                    ).toFixed(0)}%`
                                                    : "—"}
                                            </strong>
                                        </>
                                    ) : (
                                        <>
                                            <span>Motion</span>

                                            <strong>
                                                {typeof detection.motionPercentage ===
                                                    "number"
                                                    ? `${detection.motionPercentage.toFixed(
                                                        1
                                                    )}%`
                                                    : "—"}
                                            </strong>
                                        </>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default DetectionLog;