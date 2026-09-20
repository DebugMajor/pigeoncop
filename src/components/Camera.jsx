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
    const [detections, setDetections] = useState([]);

    const deterrentSoundRef = useRef(null);
    const deterrentCooldownUntilRef = useRef(0);

    // DETERRENT SOUND
    useEffect(() => {
        deterrentSoundRef.current = new Audio(
            "/sounds/motion-feedback-soothing-rock.wav"
        );

        deterrentSoundRef.current.preload = "auto";

        return () => {
            if (deterrentSoundRef.current) {
                deterrentSoundRef.current.pause();
                deterrentSoundRef.current = null;
            }
        };
    }, []);

    // START CAMERA
    async function startCamera() {
        try {
            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: true,
                });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setStatus("active");
        } catch (error) {
            console.error("Camera error:", error);
            setStatus("error");
        }
    }

    // CAMERA STATUS
    useEffect(() => {
        if (status === "loading") {
            startCamera();
        } else if (status === "active") {
            if (intervalRef.current == null) {
                intervalRef.current = setInterval(
                    captureFrame,
                    500
                );
            }
        } else if (status === "stopping") {
            stopCamera();
        }
    }, [status]);

    // STOP CAMERA
    function stopCamera() {
        if (streamRef.current != null) {
            const tracks =
                streamRef.current.getTracks();

            tracks.forEach((track) => {
                track.stop();
            });

            streamRef.current = null;
        }

        if (videoRef.current?.srcObject != null) {
            videoRef.current.srcObject = null;
        }

        setStatus("offline");

        clearInterval(intervalRef.current);
        intervalRef.current = null;

        setVideoReady(false);
        setMotionDetected(false);
        setDetections([]);

        prevFrameRef.current = null;
        consecutiveMotionFrames.current = 0;
        consecutiveNoMotionFrames.current = 0;
        armed.current = true;
        lastDetectionTimeRef.current = null;
    }

    // SNAPSHOT
    function captureSnapshot() {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (
            !video ||
            !canvas ||
            !video.videoWidth ||
            !video.videoHeight
        ) {
            return null;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");

        if (!context) {
            return null;
        }

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        return canvas.toDataURL(
            "image/jpeg",
            0.85
        );
    }

    // CONFIRMED DETECTION
    function handleConfirmedDetection(detection) {
        const snapshot = captureSnapshot();

        const detectionWithSnapshot = {
            ...detection,
            snapshot,
            capturedAt: snapshot ? Date.now() : null,
            deterrentStatus:
                detection.type === "bird" ? "Triggered" : "Cooldown",
        };

        // Add confirmed event to application state
        onDetection(detectionWithSnapshot);

        // Activate deterrent ONLY for a confirmed bird
        if (detection.type === "bird") {
            const currentTime = Date.now();
            const cooldownMs = 30000;

            if (currentTime < deterrentCooldownUntilRef.current) {
                console.log("Deterrent skipped - cooldown active.");
                return;
            }

            if (deterrentSoundRef.current) {
                deterrentCooldownUntilRef.current =
                    currentTime + cooldownMs;

                deterrentSoundRef.current.currentTime = 0;

                deterrentSoundRef.current
                    .play()
                    .then(() => {
                        console.log(
                            "Deterrent activated for confirmed pigeon."
                        );
                    })
                    .catch((error) => {
                        console.log(
                            "Deterrent playback failed:",
                            error
                        );
                    });
            }
        }
    }

    //Motion Detection
    function captureFrame() {
        const canvasObj = canvasRef.current;
        const video = videoRef.current;

        if (
            !canvasObj ||
            !video ||
            !video.videoWidth ||
            !video.videoHeight
        ) {
            return;
        }

        const context =
            canvasObj.getContext("2d");

        if (!context) {
            return;
        }

        canvasObj.width = video.videoWidth;
        canvasObj.height = video.videoHeight;

        context.drawImage(
            video,
            0,
            0,
            canvasObj.width,
            canvasObj.height
        );

        const currentFrame =
            context.getImageData(
                0,
                0,
                canvasObj.width,
                canvasObj.height
            );

        if (prevFrameRef.current === null) {
            prevFrameRef.current = currentFrame;
            return;
        }

        const prevPixels =
            prevFrameRef.current.data;

        const currPixels =
            currentFrame.data;

        const frameThreshold = 2;
        const totalPixels =
            currPixels.length / 4;

        const pixelThreshold = 30;

        let changedPixels = 0;

        for (
            let i = 0;
            i < currPixels.length;
            i += 4
        ) {
            const red = Math.abs(
                currPixels[i] -
                prevPixels[i]
            );

            const green = Math.abs(
                currPixels[i + 1] -
                prevPixels[i + 1]
            );

            const blue = Math.abs(
                currPixels[i + 2] -
                prevPixels[i + 2]
            );

            const currentPixelDiff =
                red + green + blue;

            if (
                currentPixelDiff >
                pixelThreshold
            ) {
                changedPixels++;
            }
        }

        const motionPercentage =
            (changedPixels /
                totalPixels) *
            100;

        prevFrameRef.current =
            currentFrame;

        const motionThreshold = 10;

        if (
            motionPercentage >
            motionThreshold
        ) {
            setMotionDetected(true);

            consecutiveMotionFrames.current +=
                1;

            consecutiveNoMotionFrames.current = 0;

            const currentTime = Date.now();

            if (
                consecutiveMotionFrames.current >=
                frameThreshold &&
                armed.current === true &&
                (
                    lastDetectionTimeRef.current ===
                    null ||
                    currentTime -
                    lastDetectionTimeRef.current >
                    5000
                )
            ) {
                lastDetectionTimeRef.current =
                    currentTime;

                console.log(
                    "Motion detected - AI gate opened:",
                    motionPercentage.toFixed(2) +
                    "%"
                );

                consecutiveMotionFrames.current = 0;
                armed.current = false;
            }
        } else {
            setMotionDetected(false);

            consecutiveMotionFrames.current = 0;

            consecutiveNoMotionFrames.current +=
                1;

            const requiredNoMotionFrames = 3;

            if (
                consecutiveNoMotionFrames.current >=
                requiredNoMotionFrames
            ) {
                armed.current = true;
            }
        }
    }

    function renderBoundingBoxes() {
        const video = videoRef.current;

        if (
            !video ||
            !video.videoWidth ||
            !video.videoHeight ||
            !video.clientWidth ||
            !video.clientHeight
        ) {
            return null;
        }

        const containerWidth =
            video.clientWidth;

        const containerHeight =
            video.clientHeight;

        const videoWidth =
            video.videoWidth;

        const videoHeight =
            video.videoHeight;

        const scale = Math.max(
            containerWidth / videoWidth,
            containerHeight / videoHeight
        );

        const renderedWidth =
            videoWidth * scale;

        const renderedHeight =
            videoHeight * scale;

        const offsetX =
            (containerWidth -
                renderedWidth) /
            2;

        const offsetY =
            (containerHeight -
                renderedHeight) /
            2;

        return detections.map(
            (detection, index) => {
                const left =
                    detection.x1 *
                    scale +
                    offsetX;

                const top =
                    detection.y1 *
                    scale +
                    offsetY;

                const width =
                    (detection.x2 -
                        detection.x1) *
                    scale;

                const height =
                    (detection.y2 -
                        detection.y1) *
                    scale;

                const isHuman =
                    detection.type ===
                    "human";

                return (
                    <div
                        key={`${detection.id ?? "detection"}-${index}`}
                        style={{
                            position: "absolute",
                            left: `${left}px`,
                            top: `${top}px`,
                            width: `${width}px`,
                            height: `${height}px`,
                            border: `3px solid ${isHuman
                                ? "#00ff88"
                                : "#00ff88"
                                }`,
                            boxSizing:
                                "border-box",
                            pointerEvents:
                                "none",
                            zIndex: 10,
                        }}
                    >
                        <div
                            style={{
                                position:
                                    "absolute",
                                top: "-30px",
                                left: "-3px",
                                background:
                                    "#00ff88",
                                color: "#000",
                                padding:
                                    "4px 8px",
                                fontSize:
                                    "12px",
                                fontWeight:
                                    "700",
                                lineHeight:
                                    "1",
                                borderRadius:
                                    "4px",
                                whiteSpace:
                                    "nowrap",
                            }}
                        >
                            {detection.name ||
                                "Pigeon"}{" "}
                            {(
                                detection.confidence *
                                100
                            ).toFixed(0)}
                            %
                        </div>
                    </div>
                );
            }
        );
    }
    //UI
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
                    display:
                        status === "offline" ||
                            status === "error"
                            ? "none"
                            : "block",
                }}
            >
                <div className="camera-header">
                    <h5 className="camera-title">
                        Live Camera Feed
                    </h5>

                    <div className="camera-line"></div>

                    {status === "active" && (
                        <div className="monitoring-status">
                            🟢 MONITORING ACTIVE
                        </div>
                    )}
                </div>

                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: "900px",
                        margin: "0 auto",
                        overflow: "hidden",
                    }}
                >
                    <video
                        onLoadedMetadata={() =>
                            setVideoReady(true)
                        }
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="d-block mx-auto videoEl"
                        style={{
                            width: "100%",
                            maxWidth: "900px",
                            maxHeight: "55vh",
                            aspectRatio:
                                "16 / 9",
                            objectFit: "cover",
                            display:
                                status ===
                                    "active"
                                    ? "block"
                                    : "none",
                        }}
                    />

                    {renderBoundingBoxes()}
                </div>

                <AIModel
                    videoRef={videoRef}
                    videoReady={videoReady}
                    motionDetected={
                        motionDetected
                    }
                    onDetection={
                        handleConfirmedDetection
                    }
                    onDetectionsChange={
                        setDetections
                    }
                />

                <canvas
                    ref={canvasRef}
                    style={{
                        display: "none",
                    }}
                />
            </div>
        </div>
    );
}

export default Camera;