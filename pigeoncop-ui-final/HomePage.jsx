import React from "react";
import "./HomePage.css";

const features = [
  ["⌁", "Real-time Detection", "Motion-gated computer vision identifies birds directly in the browser."],
  ["◉", "Smart Deterrence", "Confirmed detections can trigger an audio response with cooldown protection."],
  ["⌂", "Local Processing", "Camera and test-video processing stays on the device in the current MVP."],
  ["□", "Privacy First", "No account or cloud upload is required to demonstrate the core workflow."]
];

export default function HomePage({ onTestNow }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="pc-home">
      <header className="pc-home-nav">
        <button className="pc-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img className="pc-brand-mark" src="/logo-mark.png" alt="" />
          <img className="pc-brand-wordmark" src="/logo-wordmark.png" alt="PigeonCop" />
        </button>

        <nav className="pc-nav-links">
          <button onClick={() => scrollTo("how-it-works")}>How It Works</button>
          <button onClick={() => scrollTo("technology")}>Technology</button>
          <button onClick={() => scrollTo("about")}>About</button>
        </nav>

        <div className="pc-nav-actions">
          <a className="pc-github-btn" href="https://github.com/DebugMajor/pigeoncop" target="_blank" rel="noreferrer">● &nbsp; View on GitHub</a>
          <button className="pc-test-btn pc-test-btn-small" onClick={onTestNow}>Test Now <span>→</span></button>
        </div>
      </header>

      <main>
        <section className="pc-hero">
          <div className="pc-hero-copy">
            <div className="pc-eyebrow"><span className="pc-live-dot" /> EDGE AI&nbsp; • &nbsp;REAL-TIME MONITORING&nbsp; • &nbsp;PRIVACY FIRST</div>
            <h1><span>Detect.</span><span className="pc-accent">Deter.</span><span>Protect.</span></h1>
            <p>PigeonCop turns your browser camera into a real-time bird monitoring and deterrence system — with computer vision running locally on your device.</p>
            <div className="pc-hero-actions">
              <button className="pc-test-btn" onClick={onTestNow}><span>▶</span> Test Now <span>→</span></button>
              <a className="pc-github-btn pc-github-large" href="https://github.com/DebugMajor/pigeoncop" target="_blank" rel="noreferrer">● &nbsp; View on GitHub</a>
            </div>
            <div className="pc-model-stats">
              <div><strong>V3</strong><span>PIGEON MODEL</span></div>
              <div><strong>ONNX</strong><span>BROWSER RUNTIME</span></div>
              <div><strong>WEBGPU</strong><span>LOCAL INFERENCE</span></div>
            </div>
          </div>

          <div className="pc-monitor-preview">
            <div className="pc-preview-top"><span>LIVE MONITORING</span><span className="pc-ready"><i /> SYSTEM READY</span></div>
            <div className="pc-preview-stage">
              <div className="pc-preview-grid" />
              <div className="pc-pigeon-placeholder">
                <div className="pc-pigeon-silhouette">P</div>
                <div className="pc-detection-box"><span>PIGEON</span><b>94%</b></div>
              </div>
              <div className="pc-preview-meta"><span>◉ Motion detected</span><span>AI ACTIVE</span><span>ARMED</span></div>
            </div>
            <div className="pc-preview-footer">
              <div><span>INFERENCE</span><b>LOCAL</b></div>
              <div><span>MODEL</span><b>V3 / ONNX</b></div>
              <div><span>RUNTIME</span><b>WEBGPU</b></div>
            </div>
          </div>
        </section>

        <section className="pc-feature-strip">
          {features.map(([icon, title, text]) => (
            <div className="pc-feature" key={title}>
              <div className="pc-feature-icon">{icon}</div>
              <div><strong>{title}</strong><span>{text}</span></div>
            </div>
          ))}
        </section>

        <section id="how-it-works" className="pc-section">
          <div className="pc-section-heading">
            <span className="pc-section-kicker">01 / WORKFLOW</span>
            <h2>From camera to response.</h2>
            <p>The same pipeline powers both Live Camera and Test Video.</p>
          </div>
          <div className="pc-flow">
            {[
              ["01", "Detect", "Sample frames and gate expensive inference behind motion."],
              ["02", "Identify", "Local vision models confirm pigeons and human activity."],
              ["03", "Deter", "A confirmed bird event can trigger the selected audio deterrent."],
              ["04", "Record", "Snapshots and detection events become part of the session log."]
            ].map(([n, t, p]) => <div className="pc-flow-card" key={t}><span>{n}</span><h3>{t}</h3><p>{p}</p></div>)}
          </div>
        </section>

        <section id="technology" className="pc-section pc-tech-section">
          <div className="pc-section-heading">
            <span className="pc-section-kicker">02 / EDGE STACK</span>
            <h2>Computer vision, without the cloud loop.</h2>
            <p>Built around browser-native processing and an ONNX model running through WebGPU.</p>
          </div>
          <div className="pc-tech-grid">
            {[
              ["01", "WebGPU", "Hardware-accelerated browser inference where supported."],
              ["02", "ONNX", "Portable V3 pigeon model for local execution."],
              ["03", "Canvas API", "Frame sampling and lightweight motion gating."],
              ["04", "MediaPipe", "Human detection through browser-based vision."]
            ].map(([n, t, p]) => <div className="pc-tech-card" key={t}><span>{n}</span><strong>{t}</strong><p>{p}</p></div>)}
          </div>
        </section>

        <section id="about" className="pc-final-cta">
          <div><span className="pc-section-kicker">03 / TRY THE SYSTEM</span><h2>See PigeonCop in action.</h2><p>Use your camera or load a local test video and run the same detection pipeline.</p></div>
          <button className="pc-test-btn" onClick={onTestNow}>Open Monitoring <span>→</span></button>
        </section>
      </main>

      <footer className="pc-home-footer"><span>© 2026 PigeonCop</span><span>Detect • Deter • Protect</span><span>Local computer vision</span></footer>
    </div>
  );
}
