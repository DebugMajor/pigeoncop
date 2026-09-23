import { useRef, useEffect, useState } from "react";
import StatusCard from "./StatusCard";
import AIModel from "./AIModel";

function Camera({
    status,
    setStatus,
    onDetection,
    onMotion,
    onDeterrent,
    sourceMode,
    resetTrigger,
    playbackCommand,
    playbackAction,
    deterrentSoundPath,
    testVideoFile,
}) {
    const videoRef = useRef(null), streamRef = useRef(null), canvasRef = useRef(null), intervalRef = useRef(null), prevFrameRef = useRef(null);
    const lastDetectionTimeRef = useRef(null), consecutiveMotionFrames = useRef(0), armed = useRef(true), consecutiveNoMotionFrames = useRef(0);
    const [videoReady, setVideoReady] = useState(false), [motionDetected, setMotionDetected] = useState(false), [detections, setDetections] = useState([]);
    const deterrentSoundRef = useRef(null);
    const deterrentCooldownUntilRef = useRef(0);
    const testVideoUrlRef = useRef(null);

    useEffect(() => {
        if (!deterrentSoundPath) return;
        if (deterrentSoundRef.current) deterrentSoundRef.current.pause();
        const audio = new Audio(deterrentSoundPath);
        audio.preload = "auto";
        deterrentSoundRef.current = audio;
        return () => { audio.pause(); if (deterrentSoundRef.current === audio) deterrentSoundRef.current = null; };
    }, [deterrentSoundPath]);

    async function startCamera() {
        try {
            if (sourceMode === "test") {
                if (videoRef.current) {
                    videoRef.current.srcObject = null;
                    if (testVideoUrlRef.current) {
                        URL.revokeObjectURL(testVideoUrlRef.current);
                        testVideoUrlRef.current = null;
                    }

                    const videoSource = testVideoFile
                        ? URL.createObjectURL(testVideoFile)
                        : "/videos/pigeon-test.mp4";

                    videoRef.current.src = videoSource;

                    testVideoUrlRef.current = testVideoFile
                        ? videoSource
                        : null;
                    videoRef.current.loop = true;
                    videoRef.current.currentTime = 0;
                    await videoRef.current.play();
                }
                setStatus("active"); return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.removeAttribute("src"); await videoRef.current.play(); }
            setStatus("active");
        } catch (error) { console.error(sourceMode === "test" ? "Test video error:" : "Camera error:", error); setStatus("error"); }
    }

    useEffect(() => {
        if (status === "loading") startCamera();
        else if (status === "active" && intervalRef.current == null) intervalRef.current = setInterval(captureFrame, 500);
        else if (status === "stopping") stopCamera();
    }, [status]);

    useEffect(() => {
        if (sourceMode !== "test" || playbackCommand === 0 || !videoRef.current) return;
        if (playbackAction === "play") videoRef.current.play().catch(console.log); else videoRef.current.pause();
    }, [playbackCommand, playbackAction, sourceMode]);

    useEffect(() => {
        if (sourceMode !== "test" || resetTrigger === 0 || !videoRef.current) return;
        videoRef.current.currentTime = 0; prevFrameRef.current = null; consecutiveMotionFrames.current = 0; consecutiveNoMotionFrames.current = 0; armed.current = true; lastDetectionTimeRef.current = null; deterrentCooldownUntilRef.current = 0; setMotionDetected(false); setDetections([]); videoRef.current.play().catch(console.log);
    }, [resetTrigger, sourceMode]);

    function stopCamera() {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current?.srcObject != null) {
            videoRef.current.srcObject = null;
        }

        if (videoRef.current) {
            videoRef.current.pause();

            if (sourceMode === "test") {
                videoRef.current.removeAttribute("src");
                videoRef.current.load();
            }
        }

        if (testVideoUrlRef.current) {
            URL.revokeObjectURL(testVideoUrlRef.current);
            testVideoUrlRef.current = null;
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
        deterrentCooldownUntilRef.current = 0;
    }

    function captureSnapshot() {
        const video = videoRef.current, canvas = canvasRef.current;
        if (!video || !canvas || !video.videoWidth || !video.videoHeight) return null;
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        const context = canvas.getContext("2d"); if (!context) return null;
        context.drawImage(video, 0, 0, canvas.width, canvas.height); return canvas.toDataURL("image/jpeg", 0.85);
    }

    function handleBirdPresence() {
        const now = Date.now();
        if (now < deterrentCooldownUntilRef.current || !deterrentSoundRef.current) return;
        deterrentCooldownUntilRef.current = now + 30000;
        deterrentSoundRef.current.currentTime = 0;
        deterrentSoundRef.current.play().then(() => onDeterrent()).catch((error) => console.log("Deterrent playback failed:", error));
    }

    function handleConfirmedDetection(detection) {
        const snapshot = captureSnapshot();
        onDetection({ ...detection, snapshot, capturedAt: snapshot ? Date.now() : null, deterrentStatus: detection.type === "bird" ? "Triggered" : "Cooldown" });
    }

    function captureFrame() {
        const canvas = canvasRef.current, video = videoRef.current;
        if (!canvas || !video || !video.videoWidth || !video.videoHeight) return;
        const context = canvas.getContext("2d"); if (!context) return;
        canvas.width = video.videoWidth; canvas.height = video.videoHeight; context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const currentFrame = context.getImageData(0, 0, canvas.width, canvas.height);
        if (!prevFrameRef.current) { prevFrameRef.current = currentFrame; return; }
        const prev = prevFrameRef.current.data, curr = currentFrame.data; let changedPixels = 0;
        for (let i = 0; i < curr.length; i += 4) { if (Math.abs(curr[i] - prev[i]) + Math.abs(curr[i + 1] - prev[i + 1]) + Math.abs(curr[i + 2] - prev[i + 2]) > 30) changedPixels++; }
        const motionPercentage = (changedPixels / (curr.length / 4)) * 100; prevFrameRef.current = currentFrame;
        if (motionPercentage > 10) {
            setMotionDetected(true); consecutiveMotionFrames.current += 1; consecutiveNoMotionFrames.current = 0;
            const now = Date.now();
            if (consecutiveMotionFrames.current >= 2 && armed.current && (lastDetectionTimeRef.current === null || now - lastDetectionTimeRef.current > 5000)) { lastDetectionTimeRef.current = now; onMotion(motionPercentage); consecutiveMotionFrames.current = 0; armed.current = false; }
        } else {
            setMotionDetected(false); consecutiveMotionFrames.current = 0; consecutiveNoMotionFrames.current += 1;
            if (consecutiveNoMotionFrames.current >= 3) armed.current = true;
        }
    }

    function renderBoundingBoxes() {
        const video = videoRef.current; if (!video?.videoWidth || !video.videoHeight || !video.clientWidth || !video.clientHeight) return null;
        const scale = Math.max(video.clientWidth / video.videoWidth, video.clientHeight / video.videoHeight), offsetX = (video.clientWidth - video.videoWidth * scale) / 2, offsetY = (video.clientHeight - video.videoHeight * scale) / 2;
        return detections.map((detection, index) => {
            const left = detection.x1 * scale + offsetX, top = detection.y1 * scale + offsetY, width = (detection.x2 - detection.x1) * scale, height = (detection.y2 - detection.y1) * scale;
            return <div key={`${detection.id ?? "detection"}-${index}`} style={{ position: "absolute", left, top, width, height, border: "3px solid #00ff88", boxSizing: "border-box", pointerEvents: "none", zIndex: 10 }}><div style={{ position: "absolute", top: "-30px", left: "-3px", background: "#00ff88", color: "#000", padding: "4px 8px", fontSize: "12px", fontWeight: "700", lineHeight: "1", borderRadius: "4px", whiteSpace: "nowrap" }}>{detection.name || "Pigeon"} {(detection.confidence * 100).toFixed(0)}%</div></div>;
        });
    }

    return <div>
        {status === "loading" && <StatusCard title="Waiting for permission" message={sourceMode === "test" ? "Loading test video" : "Waiting for user permission"} />}
        {status === "error" && <StatusCard title="Camera Error" message={sourceMode === "test" ? "Test video could not be loaded." : "Camera access denied. Please enable camera access from your browser settings and refresh the page."} />}
        <div className="card shadow-lg p-3 section-spacing" style={{ display: status === "offline" || status === "error" ? "none" : "block" }}>
            <div className="camera-header"><h5 className="camera-title">{sourceMode === "test" ? "Test Video Feed" : "Live Camera Feed"}</h5><div className="camera-line" />{status === "active" && <div className="monitoring-status">{sourceMode === "test" ? "TEST MODE" : "MONITORING ACTIVE"}</div>}</div>
            <div style={{ position: "relative", width: "100%", maxWidth: "900px", margin: "0 auto", overflow: "hidden" }}>
                <video onLoadedMetadata={() => setVideoReady(true)} ref={videoRef} autoPlay playsInline muted={sourceMode === "test"} className="d-block mx-auto videoEl" style={{ width: "100%", maxWidth: "900px", maxHeight: "55vh", aspectRatio: "16 / 9", objectFit: "cover", display: status === "active" ? "block" : "none" }} />
                {renderBoundingBoxes()}
            </div>
            <AIModel videoRef={videoRef} videoReady={videoReady} motionDetected={motionDetected} onDetection={handleConfirmedDetection} onDetectionsChange={setDetections} resetTrigger={resetTrigger} onBirdPresence={handleBirdPresence} />
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    </div>;
}

export default Camera;
