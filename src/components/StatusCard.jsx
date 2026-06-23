function StatusCard({ title, message, buttonText, onRetry }) {
    return (
        <div>
            <div className="card w-75 mb-3">
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>
                    <p className="card-text">{message}</p>
                    <button className="btn btn-primary" onClick={onRetry}>{buttonText}</button>
                </div>
            </div>
        </div>
    )
}

export default StatusCard