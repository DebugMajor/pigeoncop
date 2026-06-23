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
            <h3>Status : {status}</h3>
            {status === "loading" && (
                <StatusCard
                    title="Loading"
                    message="Waiting for user permission"
                />
            )}

            {status === "error" && (
                <StatusCard
                    title="Error"
                    message="Camera access denied.Please enable camera access from your browser settings and refresh the page."
                />
            )}

            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="d-block mx-auto mt-3 border-dark rounded"
                style={{
                    maxWidth: "700px",
                    width: "100%",
                    display: status === "active" ? "block" : "none"
                }}
            />
        </div>
    );
}


export default Camera;