import { useRef, useEffect, useState } from "react";
import StatusCard from "./StatusCard";
import AIModel from "./AIModel";

function Camera({ status, setStatus, onDetection }) {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const canvasRef = useRef(null);
    const intervalRef = useRef(null);
    const prevFrameRef = useRef(null);
    const lastDetectionTimeRef = useRef(null);
    const consecutiveMotionFrames = useRef(0);
    const armed = useRef(true);
    const consecutiveNoMotionFrames = useRef(0);
    const [videoReady, setVideoReady] = useState(false);
    const [motionDetected, setMotionDetected] = useState(false);
    const motionSoundRef = useRef(null);

    useEffect(() => {
        motionSoundRef.current = new Audio("/sounds/motion-feedback-soothing-rock.wav");
    }, [])

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
                intervalRef.current = setInterval(captureFrame, 500);
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
            setVideoReady(false);
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

        // console.log("Frame Captured");

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

        //Frame Diffrence Motion Detecton

        const currentFrame = context.getImageData(
            0,
            0,
            canvasObj.width,
            canvasObj.height
        );

        if (prevFrameRef.current === null) {
            prevFrameRef.current = currentFrame;
            return;
        };
        const prevPixels = prevFrameRef.current.data;
        const currPixels = currentFrame.data;

        const frameThreshold = 2;
        const totalPixels = currPixels.length / 4;
        const pixelThreshold = 30;
        let changedPixels = 0;
        for (let i = 0; i < currPixels.length; i += 4) {
            const red = Math.abs(currPixels[i] - prevPixels[i]);
            const green = Math.abs(currPixels[i + 1] - prevPixels[i + 1]);
            const blue = Math.abs(currPixels[i + 2] - prevPixels[i + 2]);
            const currPixelDiff = red + green + blue;

            if (currPixelDiff > pixelThreshold) {
                changedPixels++;
            }
        }
        const motionPercentage = (changedPixels / totalPixels) * 100;
        prevFrameRef.current = currentFrame;
        const motionThreshold = 10;
        // console.log(motionPercentage + "%");
        // console.log(motionThreshold);
        if (motionPercentage > motionThreshold) {
            // Motion detected
            setMotionDetected(true);
            consecutiveMotionFrames.current += 1;

            // Reset no-motion counter because motion is present
            consecutiveNoMotionFrames.current = 0;

            const currentTime = Date.now();

            if (consecutiveMotionFrames.current >= frameThreshold) {
                if (
                    lastDetectionTimeRef.current === null ||
                    currentTime - lastDetectionTimeRef.current > 5000
                ) {
                    if (armed.current === true) {
                        lastDetectionTimeRef.current = currentTime;

                        const detection = {
                            type: "motion",
                            id: crypto.randomUUID(),
                            timestamp: currentTime,
                            motionPercentage: motionPercentage
                        };

                        onDetection(detection);

                        motionSoundRef.current.currentTime = 0
                        motionSoundRef.current.play().catch((error) => {
                            console.log("Motion sound playback failed:", error);
                        });

                        consecutiveMotionFrames.current = 0;
                        armed.current = false;
                    }
                }
            }
        }
        else {
            // No motion detected
            setMotionDetected(false);
            consecutiveMotionFrames.current = 0;
            consecutiveNoMotionFrames.current += 1;

            // Re-arm only after 3 consecutive no-motion frames
            const requiredNoMotionFrames = 3;

            if (consecutiveNoMotionFrames.current >= requiredNoMotionFrames) {
                armed.current = true;
            }
        }
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

                <video onLoadedMetadata={() => setVideoReady(true)}
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
                <AIModel videoRef={videoRef} videoReady={videoReady} motionDetected={motionDetected} onDetection={onDetection} />
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