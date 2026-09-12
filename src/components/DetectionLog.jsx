function DetectionLog({ detections }) {
    return (
        <div className="card shadow-lg logs-card">
            <div className="card-body">

                <h5 className="card-title mb-4">
                    Detection Logs
                </h5>

                <div>
                    {detections.length === 0 ? (
                        <p>Awaiting Detections....</p>
                    ) : (
                        detections.map((detection) => (
                            <div className="log-entry" key={detection.id}>
                                <p>ID: {detection.id}</p>
                                <p>
                                    Time: {new Date(detection.timestamp).toLocaleTimeString()}
                                </p>
                                <p>
                                    Motion Percentage: {(detection.motionPercentage).toFixed(2)}%
                                </p>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}

export default DetectionLog;