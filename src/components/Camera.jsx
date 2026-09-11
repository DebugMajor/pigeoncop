import { useRef, useEffect } from "react";
import StatusCard from "./StatusCard";

function Camera({ status, setStatus }) {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const canvasRef = useRef(null);
    const intervalRef = useRef(null);

    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true
            });
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setStatus("active");
        }
        catch (error) {
            console.error(error);
            setStatus("error");
        }
    }

    useEffect(() => {
        if (status === "loading") {
            startCamera();
        }
        else if (status === "active") {
            //start automatic capturing
            if (intervalRef.current == null)
                intervalRef.current = setInterval(captureFrame, 100);
        }
        else if (status === "stopping") {
            stopCamera();
        }

    }, [status]);

    function stopCamera() {
        //stop tracks
        if (streamRef.current != null) {
            const tracks = streamRef.current.getTracks();
            tracks.forEach((track) => {
                track.stop();
            })
            streamRef.current = null;
            //detach stream from video and cleanup video element
            if (videoRef.current.srcObject != null)
                videoRef.current.srcObject = null;
            //Update UI   
            setStatus("offline");
            //Stop automatic canvas capturing
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }

    function captureFrame() {
        const canvasObj = canvasRef.current;
        const video = videoRef.current;

        // Guard clause
        if (!canvasObj || !video) {
            return;
        }

        const context = canvasObj.getContext("2d");

        console.log("Frame Captured");

        // Match canvas size to the video
        canvasObj.width = video.videoWidth;
        canvasObj.height = video.videoHeight;

        // Copy current video frame onto the canvas
        context.drawImage(
            video,
            0,
            0,
            canvasObj.width,
            canvasObj.height
        );
    }
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
                    message="Camera access denied. Please enable camera access from your browser settings and refresh the page."
                />
            )}

            <div
                className="card shadow-lg p-3 section-spacing"
                style={{
                    display: status === "offline" || status === "error"
                        ? "none"
                        : "block"
                }}
            >
                <div className="camera-header">
                    <h5 className="camera-title">Live Camera Feed</h5>

                    <div className="camera-line"></div>

                    {status === "active" && (
                        <div className="monitoring-status">
                            🟢 MONITORING ACTIVE
                        </div>
                    )}
                </div>

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
                        objectFit: "cover",
                        display: status === "active" ? "block" : "none"
                    }}
                />
                <canvas
                    ref={canvasRef}
                    style={{
                        border: "2px solid red"
                    }}
                /> <br />

            </div>
        </div>
    );
}

export default Camera;