import { YOLO } from "@ultralytics/yolo";
import { useEffect, useState } from "react";


function AIModel({ videoRef, videoReady }) {
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function loadModel() {
            try {
                const loadedModel = await YOLO.load("/models/yolo26n.onnx");

                setModel(loadedModel);
                setLoading(false);

                console.log("YOLO model loaded!");
                console.log("Device:", loadedModel.device);
            }
            catch (error) {
                console.error("Failed to load YOLO model:", error);
                setError(error.message);
                setLoading(false);
            }
        }

        loadModel();
    }, []);

    useEffect(() => {
        if (!model || !videoReady || !videoRef?.current)
            return;
        async function detect() {
            const res = await model.predict(videoRef.current);
            console.log("Detections:", res.boxes.length);

            res.boxes.forEach((box) => {
                console.log(
                    "Class:", box.name,
                    "Confidence:", box.conf,
                    "Box:", box.x1, box.y1, box.x2, box.y2
                );
            });

        }
        detect();
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