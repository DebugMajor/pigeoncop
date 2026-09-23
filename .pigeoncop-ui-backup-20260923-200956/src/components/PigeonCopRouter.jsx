import { useEffect, useState } from "react";
import App from "../App";
import HomePage from "./HomePage";

function getView() {
    return window.location.pathname.toLowerCase() === "/monitor" ? "monitor" : "home";
}

function PigeonCopRouter() {
    const [view, setView] = useState(getView);

    useEffect(() => {
        const handlePopState = () => setView(getView());
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const goToMonitor = () => {
        window.history.pushState({}, "", "/monitor");
        setView("monitor");
        window.scrollTo({ top: 0, behavior: "instant" });
    };

    const goHome = () => {
        window.history.pushState({}, "", "/");
        setView("home");
        window.scrollTo({ top: 0, behavior: "instant" });
    };

    if (view === "home") return <HomePage onTestNow={goToMonitor} />;

    return (
        <>
            <div className="pigeoncop-dashboard-nav">
                <button type="button" onClick={goHome}>← HOME</button>
                <span>MONITORING CONSOLE</span>
            </div>
            <App />
        </>
    );
}

export default PigeonCopRouter;
