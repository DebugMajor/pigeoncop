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

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setStatus("active");
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
                    title="Loading"
                    message="Waiting for user permission"
                />
            )}

            {status === "error" && (
                <StatusCard
                    title="Error"
                    message="Camera access denied.Please enable camera access from your browser settings and refresh the page."
                    buttonText="Try Again"
            onRetry={startCamera}
                />
            )}

            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                    display: status === "active" ? "block" : "none"
                }}
            />
        </div>
    );
}


export default Camera;