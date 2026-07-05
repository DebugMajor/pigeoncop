import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faCrow,
    faVolume,
    faStopwatch
} from "@fortawesome/free-solid-svg-icons"

function StatusPanel() {
    return (
        <div className="stats-panel">

            <div className="card stat-card">
                <div className="card-body">
                    <h5 className="stat-title">
                        Birds Today <hr />
                        <FontAwesomeIcon icon={faCrow} />
                    </h5>

                    <div className="stat-value">
                        0
                    </div>
                </div>
            </div>

            <div className="card stat-card">
                <div className="card-body">
                    <h5 className="stat-title">
                        Sounds System  <hr />
                        <FontAwesomeIcon icon={faVolume} />
                    </h5>

                    <div className="stat-value">
                        READY
                    </div>
                </div>
            </div>

            <div className="card stat-card">
                <div className="card-body">
                    <h5 className="stat-title">
                        Runtime  <hr />
                        <FontAwesomeIcon icon={faStopwatch} />
                    </h5>

                    <div className="stat-value">
                        00:00
                    </div>
                </div>
            </div>

        </div>
    )
}

export default StatusPanel;