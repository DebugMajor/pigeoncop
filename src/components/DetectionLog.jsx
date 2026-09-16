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
                                            <span>
                                                {detection.name || "Pigeon"}

                                                {isTest && (
                                                    <small
                                                        style={{
                                                            marginLeft: "8px",
                                                            opacity: 0.6,
                                                        }}
                                                    >
                                                        TEST
                                                    </small>
                                                )}
                                            </span>

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