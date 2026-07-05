function DetectionLog() {
    return (
        <div className="card shadow-lg logs-card">
            <div className="card-body">

                <h5 className="card-title mb-4">
                    Detection Logs
                </h5>

                <div className="log-entry">
                    🟢 10:42 - Monitoring Started
                </div>

                <div className="log-entry">
                    📷 10:43 - Camera Initialized
                </div>

                <div className="log-entry">
                    🔍 10:44 - Awaiting Detections...
                </div>

            </div>
        </div>
    )
}

export default DetectionLog;