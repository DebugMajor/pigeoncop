import React from "react";
import "./HomePage.css";

const PIGEON_IMAGE =
  "https://images.unsplash.com/photo-1565879566869-60c3cea002dc?fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE1fHx8ZW58MHx8fHx8&ixlib=rb-4.1.0&q=80&w=1800";

const features = [
  ["◌", "Real-time", "Detection & response"],
  ["↯", "Local", "Runs in your browser"],
  ["▣", "ONNX / WebGPU", "Optimized inference"],
  ["◇", "Privacy first", "No cloud camera feed"],
];

export default function HomePage({ onTestNow }) {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="pc-home-v5">
      <header className="pc5-nav">
        <button
          className="pc5-brand"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="PigeonCop home"
        >
          <img className="pc5-wordmark" src="/logo-wordmark.png" alt="PigeonCop" />
        </button>

        <nav className="pc5-links" aria-label="Primary navigation">
          <button className="active" onClick={() => scrollTo("top")}>Home</button>
          <button onClick={() => scrollTo("how-it-works")}>How It Works</button>
          <button onClick={() => scrollTo("technology")}>Technology</button>
          <button onClick={() => scrollTo("about")}>About</button>
        </nav>

        <div className="pc5-nav-actions">
          <a
            className="pc5-outline-btn"
            href="https://github.com/DebugMajor/pigeoncop"
            target="_blank"
            rel="noreferrer"
          >
            <span className="pc5-gh">●</span> View on GitHub
          </a>
          <button className="pc5-primary-btn pc5-test-btn" onClick={onTestNow}>
            Test Now <span>→</span>
          </button>
        </div>
      </header>

      <main id="top">
        <section className="pc5-hero">
          <div className="pc5-city-glow" />

          <div className="pc5-copy">
            <div className="pc5-pill">
              <span className="pc5-live-dot" />
              EDGE AI&nbsp; • &nbsp;REAL-TIME MONITORING&nbsp; • &nbsp;PRIVACY FIRST
            </div>

            <h1>
              <span>Detect.</span>
              <span className="mint">Deter.</span>
              <span>Protect.</span>
            </h1>

            <p>
              PigeonCop turns your browser camera into a real-time bird
              monitoring and deterrence system — with computer vision
              running locally on your device.
            </p>

            <div className="pc5-hero-buttons">
              <button className="pc5-primary-btn pc5-primary-large" onClick={onTestNow}>
                <span className="pc5-play">▶</span> Test Now <span>→</span>
              </button>

              <a
                className="pc5-outline-btn pc5-outline-large"
                href="https://github.com/DebugMajor/pigeoncop"
                target="_blank"
                rel="noreferrer"
              >
                <span className="pc5-github-symbol">●</span> View on GitHub
              </a>
            </div>

            <div className="pc5-hero-stats">
              <div><strong>V3</strong><span>PIGEON MODEL</span></div>
              <div><strong>ONNX</strong><span>BROWSER RUNTIME</span></div>
              <div><strong>WEBGPU</strong><span>LOCAL INFERENCE</span></div>
            </div>

            <div className="pc5-mini-features">
              {features.map(([icon, title, text]) => (
                <div className="pc5-mini-feature" key={title}>
                  <div className="pc5-mini-icon">{icon}</div>
                  <div><strong>{title}</strong><span>{text}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="pc5-monitor">
            <div className="pc5-monitor-head">
              <div className="pc5-monitor-title">
                <span className="pc5-signal">▮▮▮</span>
                <div>
                  <strong>LIVE MONITORING</strong>
                  <span>CAM 01 — TEST ENVIRONMENT</span>
                </div>
              </div>
              <div className="pc5-monitor-status">
                <span className="pc5-live-dot" />
                <strong>SYSTEM READY</strong>
                <small>1920 × 1080&nbsp; • &nbsp;30 FPS</small>
              </div>
            </div>

            <div className="pc5-monitor-body">
              <div className="pc5-video">
                <img
                  src={PIGEON_IMAGE}
                  alt="Pigeon standing on a rooftop"
                  className="pc5-pigeon-photo"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
                <div className="pc5-image-tint" />
                <span className="pc5-corner c1" />
                <span className="pc5-corner c2" />
                <span className="pc5-corner c3" />
                <span className="pc5-corner c4" />

                <div className="pc5-bbox">
                  <span className="pc5-label">PIGEON</span>
                  <span className="pc5-confidence">94%</span>
                </div>

                <div className="pc5-motion">
                  <span className="pc5-live-dot" />
                  Motion detected <span className="pc5-bars">▂▅▇▃▆</span>
                </div>

                <div className="pc5-time">Sep 23, 2026&nbsp;&nbsp;19:24:17</div>
              </div>

              <aside className="pc5-side-stats">
                <div className="pc5-side-card">
                  <span className="pc5-side-icon">♢</span>
                  <div><strong>3</strong><span>BIRDS DETECTED</span></div>
                </div>
                <div className="pc5-side-card">
                  <span className="pc5-side-icon">◎</span>
                  <div><strong>94%</strong><span>MODEL CONFIDENCE</span></div>
                </div>
                <div className="pc5-side-card">
                  <span className="pc5-side-icon">ϟ</span>
                  <div><strong>0.2s</strong><span>INFERENCE TIME</span></div>
                </div>

                <div className="pc5-radar">
                  <div className="pc5-radar-ring r1" />
                  <div className="pc5-radar-ring r2" />
                  <div className="pc5-radar-ring r3" />
                  <div className="pc5-radar-sweep" />
                  <div className="pc5-radar-dot d1" />
                  <div className="pc5-radar-dot d2" />
                  <div className="pc5-radar-dot d3" />
                  <span>SCANNING AREA...</span>
                </div>
              </aside>
            </div>

            <div className="pc5-monitor-footer">
              <div><span>INFERENCE</span><strong>LOCAL</strong><small>Runs on your device</small></div>
              <div><span>MODEL</span><strong>V3 / ONNX</strong><small>Optimized for real-time</small></div>
              <div><span>RUNTIME</span><strong>WEBGPU</strong><small>Accelerated inference</small></div>
              <div><span>STATUS</span><strong className="mint">AI ACTIVE</strong><small>Monitoring for birds</small></div>
            </div>
          </div>
        </section>

        <section className="pc5-proof-strip">
          <div><div className="pc5-proof-icon">⌁</div><div><strong>100%</strong><span>Runs locally in browser</span><small>No camera data leaves your device.</small></div></div>
          <div><div className="pc5-proof-icon">ϟ</div><div><strong>Real-time</strong><span>Detection & response</span><small>Motion-gated inference.</small></div></div>
          <div><div className="pc5-proof-icon">▣</div><div><strong>ONNX / WebGPU</strong><span>Optimized inference</span><small>High performance in browser.</small></div></div>
          <div><div className="pc5-proof-icon">◇</div><div><strong>Built for</strong><span>Homes · Offices · Campuses</span><small>Cleaner spaces, happier places.</small></div></div>
          <div className="pc5-proof-tag">CLEANER SPACES<br />HAPPIER PLACES</div>
        </section>

        <section id="how-it-works" className="pc5-section">
          <div className="pc5-section-head">
            <span>01 / WORKFLOW</span>
            <h2>One pipeline. Two input modes.</h2>
            <p>Live Camera and Test Video share the same motion-gated AI detection flow.</p>
          </div>
          <div className="pc5-flow-grid">
            {[
              ["01", "Detect", "Sample frames and gate expensive inference behind motion."],
              ["02", "Identify", "Run local vision models and confirm a bird event."],
              ["03", "Deter", "Trigger the selected audio response with cooldown protection."],
              ["04", "Record", "Capture snapshots and add the event to the session log."]
            ].map(([n, t, p]) => (
              <article className="pc5-flow-card" key={t}>
                <span>{n}</span><h3>{t}</h3><p>{p}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="technology" className="pc5-section pc5-tech">
          <div className="pc5-section-head">
            <span>02 / TECHNOLOGY</span>
            <h2>Edge AI, inside the browser.</h2>
            <p>Built around browser-native vision, an ONNX model, and WebGPU acceleration.</p>
          </div>
          <div className="pc5-tech-grid">
            {[
              ["WebGPU", "Accelerated inference where supported."],
              ["ONNX", "Portable V3 pigeon model for local execution."],
              ["Canvas API", "Frame sampling and lightweight motion gating."],
              ["MediaPipe", "Browser-based human detection."]
            ].map(([t, p], i) => (
              <div className="pc5-tech-card" key={t}>
                <span>0{i + 1}</span><strong>{t}</strong><p>{p}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="pc5-cta">
          <div>
            <span>03 / TRY THE SYSTEM</span>
            <h2>See PigeonCop in action.</h2>
            <p>Open the monitoring console and test Live Camera or a local video file.</p>
          </div>
          <button className="pc5-primary-btn" onClick={onTestNow}>Open Monitoring <span>→</span></button>
        </section>
      </main>

      <footer className="pc5-footer">
        <span>© 2026 PigeonCop</span>
        <span>Detect • Deter • Protect</span>
        <span>Local computer vision</span>
      </footer>
    </div>
  );
}
