function StatusCard({ title, message }) {
    return (
        <div className="status-card">
            <div className="card-body">
                <h5 className="card-title">{title}</h5>
                <p className="card-text">{message}</p>
            </div>
        </div>
    );
}

export default StatusCard;
