import { useRef, useEffect } from "react";

function Camera() {
    const videoRef = useRef(null);
    useEffect(() => {
        async function startCamera() {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true
            })
            videoRef.current.srcObject = stream;

        }
        startCamera();
    }, [])

    return (
        <div>
            <h1>Pigeon Cop</h1>
            <video ref={videoRef} autoPlay playsInline ></video>
        </div>
    )
}

export default Camera;