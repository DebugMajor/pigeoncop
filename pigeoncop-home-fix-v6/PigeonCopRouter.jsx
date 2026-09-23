import { useEffect, useState } from "react";
import App from "../App";
import HomePage from "./HomePage";

export default function PigeonCopRouter() {
  const getPath = () => window.location.pathname.replace(/\/+$/, "") || "/";
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const onPop = () => setPath(getPath());
    window.addEventListener("popstate", onPop);

    const onDashboardLogoClick = (event) => {
      if (!window.location.pathname.includes("/monitor")) return;
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest(
          '.pc-dashboard-shell img[src*="logo-wordmark"], .pc-dashboard-shell img[src*="logo-mark"]'
        )
      ) {
        event.preventDefault();
        window.location.assign("/");
      }
    };

    document.addEventListener("click", onDashboardLogoClick);

    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("click", onDashboardLogoClick);
    };
  }, []);

  const go = (nextPath) => {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (path === "/monitor") {
    return (
      <div className="pc-dashboard-shell">
        <App />
      </div>
    );
  }

  return <HomePage onTestNow={() => go("/monitor")} />;
}
