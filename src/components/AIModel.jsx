import { YOLO } from "@ultralytics/yolo";
import { useEffect, useState, useRef } from "react";
import {
    FaceDetector as MediaPipeFaceDetector,
    FilesetResolver,
} from "@mediapipe/tasks-vision";

function AIModel({
    videoRef,
    videoReady,
    motionDetected,
    onDetection,
    onDetectionsChange,
}) {
    const [pigeonModel, setPigeonModel] = useState(null);
    const [faceModel, setFaceModel] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [detections, setDetections] = useState([]);

    const aiPredictions = useRef(0);
    const isProcessing = useRef(false);
    const consecutiveNoPigeonFrames = useRef(0);
    const birdConfirmedRef = useRef(false);
    // LOAD PIGEON MODEL + FACE MODEL
    useEffect(() => {
        let cancelled = false;

        async function loadModels() {
            try {
                console.log("Loading pigeon model...");

                const loadedPigeonModel = await YOLO.load(
                    "/models/pigeon-v3.onnx"
                );

                console.log(
                    "Pigeon model loaded!",
                    loadedPigeonModel.device
                );

                console.log("Loading face detector...");

                const vision =
                    await FilesetResolver.forVisionTasks(
                        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
                    );

                const loadedFaceModel =
                    await MediaPipeFaceDetector.createFromOptions(
                        vision,
                        {
                            baseOptions: {
                                modelAssetPath:
                                    "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
                                delegate: "GPU",
                            },

                            runningMode: "VIDEO",

                            minDetectionConfidence: 0.5,
                        }
                    );

                if (cancelled) {
                    loadedFaceModel.close();
                    return;
                }

                setPigeonModel(loadedPigeonModel);
                setFaceModel(loadedFaceModel);
                setLoading(false);

                console.log(
                    "Face detector loaded!"
                );
            } catch (err) {
                console.error(
                    "Failed to load AI models:",
                    err
                );

                setError(err.message);
                setLoading(false);
            }
        }

        loadModels();

        return () => {
            cancelled = true;

            if (faceModel) {
                faceModel.close();
            }
        };
    }, []);

    const confidenceThreshold = 0.5;

    // BIRD CONFIRMATION
    function confirmBirdDetection(box) {
        if (birdConfirmedRef.current) {
            return;
        }

        aiPredictions.current += 1;

        console.log(
            "Bird AI Confirmation:",
            `${aiPredictions.current} / 3`
        );

        if (aiPredictions.current >= 3) {
            birdConfirmedRef.current = true;

            const birdEvent = {
                type: "bird",
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                confidence: box.conf,
                name: box.name,
                x1: box.x1,
                y1: box.y1,
                x2: box.x2,
                y2: box.y2,
            };

            onDetection(birdEvent);

            console.log("Bird confirmed!");

            aiPredictions.current = 0;
        }
    }

    // DETECTION LOOP
    useEffect(() => {
        if (
            !pigeonModel ||
            !faceModel ||
            !videoReady ||
            !videoRef?.current
        ) {
            return;
        }

        async function detect() {
            if (isProcessing.current) {
                return;
            }

            const video = videoRef.current;

            if (
                !video ||
                video.readyState < 2 ||
                !video.videoWidth ||
                !video.videoHeight
            ) {
                return;
            }

            try {
                isProcessing.current = true;

                const allDetections = [];

                // 1. FACE DETECTION
                const timestamp = performance.now();

                const faceResult =
                    faceModel.detectForVideo(
                        video,
                        timestamp
                    );

                const faceDetections =
                    (faceResult.detections || []).map(
                        (detection, index) => {
                            const box =
                                detection.boundingBox;

                            return {
                                id: `face-${index}`,

                                x1: box.originX,
                                y1: box.originY,

                                x2:
                                    box.originX +
                                    box.width,

                                y2:
                                    box.originY +
                                    box.height,

                                confidence:
                                    detection.categories?.[0]
                                        ?.score ?? 0,

                                name: "Human",
                                type: "human",
                            };
                        }
                    );

                // 2. PIGEON DETECTION
                let pigeonDetections = [];

                if (motionDetected) {
                    const result =
                        await pigeonModel.predict(
                            video
                        );

                    pigeonDetections =
                        result.boxes
                            .filter(
                                (box) =>
                                    box.conf >=
                                    confidenceThreshold
                            )
                            .map((box) => ({
                                id: `pigeon-${crypto.randomUUID()}`,

                                x1: box.x1,
                                y1: box.y1,
                                x2: box.x2,
                                y2: box.y2,

                                confidence: box.conf,
                                name: "Pigeon",
                                type: "bird",
                            }));

                    console.log(
                        "Pigeon YOLO output:",
                        result.boxes.map((box) => ({
                            confidence: box.conf,
                            accepted: box.conf >= confidenceThreshold,
                        }))
                    );

                    const acceptedPigeon =
                        result.boxes.find(
                            (box) =>
                                box.conf >=
                                confidenceThreshold
                        );

                    if (acceptedPigeon) {
                        consecutiveNoPigeonFrames.current = 0;

                        confirmBirdDetection(acceptedPigeon);
                    } else {
                        aiPredictions.current = 0;

                        consecutiveNoPigeonFrames.current += 1;

                        const requiredNoPigeonFrames = 3;

                        if (
                            consecutiveNoPigeonFrames.current >=
                            requiredNoPigeonFrames
                        ) {
                            birdConfirmedRef.current = false;
                        }
                    }
                } else {
                    aiPredictions.current = 0;
                    consecutiveNoPigeonFrames.current += 1;

                    const requiredNoPigeonFrames = 3;

                    if (
                        consecutiveNoPigeonFrames.current >=
                        requiredNoPigeonFrames
                    ) {
                        birdConfirmedRef.current = false;
                    }
                }


                // 3. COMBINE RESULTS
                allDetections.push(
                    ...faceDetections,
                    ...pigeonDetections
                );

                setDetections(allDetections);
                onDetectionsChange(
                    allDetections
                );

                if (faceDetections.length > 0) {
                    console.log(
                        "Human detected:",
                        faceDetections.length
                    );
                }
            } catch (err) {
                console.error(
                    "Detection error:",
                    err
                );
            } finally {
                isProcessing.current = false;
            }
        }

        detect();

        const interval = setInterval(
            detect,
            500
        );

        return () => {
            clearInterval(interval);
        };
    }, [
        pigeonModel,
        faceModel,
        videoReady,
        videoRef,
        motionDetected,
        onDetection,
        onDetectionsChange,
    ]);

    // UI
    if (loading) {
        return (
            <p>
                Loading AI models...
            </p>
        );
    }

    if (error) {
        return (
            <p>
                AI Model Error: {error}
            </p>
        );
    }

    return (
        <div>
            <p>
                AI Models Ready
            </p>

            <pre>
                {JSON.stringify(
                    detections,
                    null,
                    2
                )}
            </pre>
        </div>
    );
}

export default AIModel;