import { YOLO } from "@ultralytics/yolo";
import { useEffect, useState, useRef } from "react";

function AIModel({ videoRef, videoReady }) {
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isProcessing = useRef(false);

    useEffect(() => {
        async function loadModel() {
            try {
                const loadedModel = await YOLO.load("/models/pigeon-v2.onnx");

                setModel(loadedModel);
                setLoading(false);

                console.log("YOLO pigeon model loaded!");
                console.log("Device:", loadedModel.device);
            } catch (error) {
                console.error("Failed to load pigeon model:", error);
                setError(error.message);
                setLoading(false);
            }
        }

        loadModel();
    }, []);

    const confidenceThreshold = 0.5;

    useEffect(() => {
        if (!model || !videoReady || !videoRef?.current) {
            return;
        }

        async function detect() {
            if (isProcessing.current) {
                return;
            }

            try {
                isProcessing.current = true;

                const res = await model.predict(videoRef.current);

                console.log("Detections:", res.boxes.length);

                res.boxes.forEach((box) => {
                    if (box.conf >= confidenceThreshold) {
                        console.log(
                            "Accepted:",
                            box.name,
                            "|",
                            box.conf,
                            "Box:",
                            box.x1,
                            box.y1,
                            box.x2,
                            box.y2
                        );
                    } else {
                        console.log(
                            "Rejected:",
                            box.name,
                            "|",
                            box.conf,
                            "Box:",
                            box.x1,
                            box.y1,
                            box.x2,
                            box.y2
                        );
                    }
                });
            } finally {
                isProcessing.current = false;
            }
        }

        detect();

        const interval = setInterval(() => {
            detect();
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [model, videoReady, videoRef]);

    if (loading) {
        return <p>Loading AI model...</p>;
    }

    if (error) {
        return <p>AI Model Error: {error}</p>;
    }

    return (
        <div>
            <p>AI Model Ready</p>
        </div>
    );
}

export default AIModel;
