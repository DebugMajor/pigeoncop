import { useEffect, useState } from "react";
import App from "../App";
import HomePage from "./HomePage";

export default function PigeonCopRouter() {
  const getPath = () => window.location.pathname.replace(/\/+$/, "") || "/";
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const onPop = () => setPath(getPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = (next) => {
    window.history.pushState({}, "", next);
    setPath(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (path === "/monitor") {
    return <div className="pc-dashboard-shell"><button className="pc-dashboard-home" onClick={() => go("/")}>← HOME</button><App /></div>;
  }

  return <HomePage onTestNow={() => go("/monitor")} />;
}
