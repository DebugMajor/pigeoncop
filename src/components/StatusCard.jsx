function StatusCard({ title, message }) {
    return (
        <div>
            <div className="card w-75 mx-auto mt-4">
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>
                    <p className="card-text">{message}</p>

                </div>
            </div>
        </div>
    )
}

export default StatusCard