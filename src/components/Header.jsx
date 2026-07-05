import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faShield
} from "@fortawesome/free-solid-svg-icons"

function Header() {
    return (
        <div className="mb-5">
            <h1 className="display-2 fw-bold hero-title">
                PigeonCop <FontAwesomeIcon icon={faShield} />
            </h1> 

            <p className="page-subtitle">
                AI powered bird monitoring and deterrence system
                using computer vision and automated response mechanisms.
            </p>
        </div>
    )
}

export default Header;