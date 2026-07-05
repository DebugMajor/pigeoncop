import { useRef, useEffect, useState } from "react";
import StatusCard from "./StatusCard";

function Camera() {
    const [status, setStatus] = useState("loading");
    const videoRef = useRef(null);


    async function startCamera() {
        try {
            setStatus("loading")
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true
            })
            setStatus("active");
            if (videoRef.current) {
                videoRef.current.srcObject = stream;

            }
        }
        catch (error) {
            console.error(error);
            setStatus("error");
        }
    }

    useEffect(() => {
        startCamera();
    }, [])

    return (
        <div>
            {status === "loading" && (
                <StatusCard
                    title="🟡 Waiting for permission"
                    message="Waiting for user permission"
                />
            )}

            {status === "error" && (
                <StatusCard
                    title="🔴 Camera Error"
                    message="Camera access denied.Please enable camera access from your browser settings and refresh the page."
                />
            )}

            {status === "active" && (

                <>

                    <div className="card shadow-lg p-3 section-spacing">
                        <h5 className="card-title mb-4 section-title">
                            <div className="camera-header">
                                <h5 className="camera-title">Live Camera Feed</h5>

                                <div className="camera-line"></div>

                                <div className="monitoring-status">
                                    🟢 MONITORING ACTIVE
                                </div>
                            </div>
                        </h5>

                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="d-block mx-auto videoEl"
                            style={{
                                width: "100%",
                                maxWidth: "900px",
                                maxHeight: "55vh",
                                aspectRatio: "16 / 9",
                                objectFit: "cover"
                            }}
                        />
                    </div>
                </>


            )}

        </div>
    );
}

export default Camera;