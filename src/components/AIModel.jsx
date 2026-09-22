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
    resetTrigger,
    onBirdPresence,
}) {
    const [pigeonModel, setPigeonModel] = useState(null);
    const [faceModel, setFaceModel] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const aiPredictions = useRef(0);
    const isProcessing = useRef(false);

    const consecutiveNoPigeonFrames = useRef(0);
    const birdConfirmedRef = useRef(false);

    const consecutiveHumanFrames = useRef(0);
    const consecutiveNoHumanFrames = useRef(0);
    const humanConfirmedRef = useRef(false);

    const onDetectionRef = useRef(onDetection);
    const onDetectionsChangeRef =
        useRef(onDetectionsChange);
    const onBirdPresenceRef =
        useRef(onBirdPresence);

    onDetectionRef.current = onDetection;
    onDetectionsChangeRef.current =
        onDetectionsChange;
    onBirdPresenceRef.current =
        onBirdPresence;

    // RESET AI STATE
    useEffect(() => {
        if (resetTrigger === 0) {
            return;
        }

        aiPredictions.current = 0;
        consecutiveNoPigeonFrames.current = 0;
        birdConfirmedRef.current = false;

        consecutiveHumanFrames.current = 0;
        consecutiveNoHumanFrames.current = 0;
        humanConfirmedRef.current = false;
    }, [resetTrigger]);

    // LOAD PIGEON MODEL + FACE MODEL
    useEffect(() => {
        let cancelled = false;

        async function loadModels() {
            try {
                console.log(
                    "Loading pigeon model..."
                );

                const loadedPigeonModel =
                    await YOLO.load(
                        "/models/pigeon-v3.onnx"
                    );

                console.log(
                    "Pigeon model loaded!",
                    loadedPigeonModel.device
                );

                console.log(
                    "Loading face detector..."
                );

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

                setPigeonModel(
                    loadedPigeonModel
                );

                setFaceModel(
                    loadedFaceModel
                );

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
        };
    }, []);

    const confidenceThreshold = 0.5;

    // BIRD CONFIRMATION
    function confirmBirdDetection(box) {
        if (
            birdConfirmedRef.current
        ) {
            onBirdPresenceRef.current?.(
                box
            );

            return;
        }

        aiPredictions.current += 1;

        console.log(
            "Bird AI Confirmation:",
            `${aiPredictions.current} / 3`
        );

        if (
            aiPredictions.current >= 3
        ) {
            birdConfirmedRef.current =
                true;

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

            onDetectionRef.current(
                birdEvent
            );

            onBirdPresenceRef.current?.(
                box
            );

            console.log(
                "Bird confirmed!"
            );

            aiPredictions.current = 0;
        }
    }

    // HUMAN CONFIRMATION
    function confirmHumanDetection(
        detection
    ) {
        if (
            humanConfirmedRef.current
        ) {
            return;
        }

        consecutiveHumanFrames.current +=
            1;

        console.log(
            "Human AI Confirmation:",
            `${consecutiveHumanFrames.current} / 2`
        );

        if (
            consecutiveHumanFrames.current >=
            2
        ) {
            humanConfirmedRef.current =
                true;

            const humanEvent = {
                type: "human",
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                confidence:
                    detection.confidence,
                name: "Human",
                x1: detection.x1,
                y1: detection.y1,
                x2: detection.x2,
                y2: detection.y2,
            };

            onDetectionRef.current(
                humanEvent
            );

            console.log(
                "Human confirmed!"
            );

            consecutiveHumanFrames.current = 0;
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
            if (
                isProcessing.current
            ) {
                return;
            }

            const video =
                videoRef.current;

            if (
                !video ||
                video.readyState < 2 ||
                !video.videoWidth ||
                !video.videoHeight
            ) {
                return;
            }

            try {
                isProcessing.current =
                    true;

                const allDetections = [];

                // 1. FACE DETECTION
                const timestamp =
                    performance.now();

                const faceResult =
                    faceModel.detectForVideo(
                        video,
                        timestamp
                    );

                const faceDetections =
                    (
                        faceResult.detections ||
                        []
                    ).map(
                        (
                            detection,
                            index
                        ) => {
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
                                    detection
                                        .categories?.[0]
                                        ?.score ??
                                    0,

                                name: "Human",
                                type: "human",
                            };
                        }
                    );

                if (
                    faceDetections.length >
                    0
                ) {
                    consecutiveNoHumanFrames.current = 0;

                    confirmHumanDetection(
                        faceDetections[0]
                    );
                } else {
                    consecutiveHumanFrames.current = 0;

                    consecutiveNoHumanFrames.current +=
                        1;

                    const requiredNoHumanFrames = 3;

                    if (
                        consecutiveNoHumanFrames.current >=
                        requiredNoHumanFrames
                    ) {
                        humanConfirmedRef.current =
                            false;
                    }
                }

                // 2. PIGEON DETECTION
                let pigeonDetections =
                    [];

                if (
                    motionDetected
                ) {
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
                            .map(
                                (box) => ({
                                    id: `pigeon-${crypto.randomUUID()}`,

                                    x1: box.x1,
                                    y1: box.y1,
                                    x2: box.x2,
                                    y2: box.y2,

                                    confidence:
                                        box.conf,

                                    name: "Pigeon",
                                    type: "bird",
                                })
                            );

                    console.log(
                        "Pigeon YOLO output:",
                        result.boxes.map(
                            (box) => ({
                                confidence:
                                    box.conf,
                                accepted:
                                    box.conf >=
                                    confidenceThreshold,
                            })
                        )
                    );

                    const acceptedPigeon =
                        result.boxes.find(
                            (box) =>
                                box.conf >=
                                confidenceThreshold
                        );

                    if (
                        acceptedPigeon
                    ) {
                        consecutiveNoPigeonFrames.current =
                            0;

                        confirmBirdDetection(
                            acceptedPigeon
                        );
                    } else {
                        aiPredictions.current = 0;

                        consecutiveNoPigeonFrames.current +=
                            1;

                        const requiredNoPigeonFrames = 3;

                        if (
                            consecutiveNoPigeonFrames.current >=
                            requiredNoPigeonFrames
                        ) {
                            birdConfirmedRef.current =
                                false;
                        }
                    }
                } else {
                    aiPredictions.current =
                        0;

                    consecutiveNoPigeonFrames.current +=
                        1;

                    const requiredNoPigeonFrames = 3;

                    if (
                        consecutiveNoPigeonFrames.current >=
                        requiredNoPigeonFrames
                    ) {
                        birdConfirmedRef.current =
                            false;
                    }
                }

                // 3. COMBINE RESULTS
                allDetections.push(
                    ...faceDetections,
                    ...pigeonDetections
                );

                onDetectionsChangeRef.current(
                    allDetections
                );

                if (
                    faceDetections.length >
                    0
                ) {
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
                isProcessing.current =
                    false;
            }
        }

        detect();

        const interval =
            setInterval(
                detect,
                500
            );

        return () => {
            clearInterval(
                interval
            );
        };
    }, [
        pigeonModel,
        faceModel,
        videoReady,
        videoRef,
        motionDetected,
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
        </div>
    );
}

export default AIModel;