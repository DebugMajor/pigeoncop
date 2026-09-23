import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PigeonCopRouter from "./components/PigeonCopRouter";
import "./index.css";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <PigeonCopRouter />
    </StrictMode>
);
