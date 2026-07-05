import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faPlay,
    faStop,
    faMusic
} from "@fortawesome/free-solid-svg-icons"
function ControlPanel() {
    return (
        <div>
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">Controls</h5>
                    <button type="button" className="btn btn-success mx-3 rounded-pill mt-3 mb-3 shadow px-4 py-2"> <FontAwesomeIcon icon={faPlay} /> Start Monitoring </button>
                    <button type="button" className="btn btn-danger mx-3 rounded-pill mt-3 mb-3 shadow px-4 py-2" > <FontAwesomeIcon icon={faStop} />  Stop Monitoring</button>
                    <button type="button" className="btn btn-warning mx-3 rounded-pill mt-3 mb-3 shadow px-4 py-2" > <FontAwesomeIcon icon={faMusic} /> Test Sound</button>

                </div>
            </div>
        </div>


    )
}

export default ControlPanel;