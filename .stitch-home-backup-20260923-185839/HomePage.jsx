import React from "react";
import "./HomePage.css";

function HomePage({ onTestNow }) {
    return (
        <div className="pc-home">
            <header className="pc-home-nav">
                <div className="pc-brand">
                    <img src="/logo-mark.png" alt="PigeonCop" className="pc-brand-mark" />
                    <img src="/logo-wordmark.png" alt="PigeonCop" className="pc-brand-wordmark" />
                </div>
                <nav className="pc-home-links" aria-label="Main navigation">
                    <a href="#how-it-works">How it works</a>
                    <a href="#technology">Technology</a>
                    <button className="pc-nav-cta" onClick={onTestNow}>TEST NOW</button>
                </nav>
            </header>

            <main>
                <section className="pc-hero">
                    <div className="pc-hero-copy">
                        <div className="pc-eyebrow"><span className="pc-live-dot" />EDGE AI / REAL-TIME COMPUTER VISION</div>
                        <h1>Detect.<br /><span>Deter.</span><br />Protect.</h1>
                        <p className="pc-hero-lead">
                            PigeonCop turns a browser camera into a real-time bird monitoring and deterrence system —
                            with computer vision running locally on your device.
                        </p>
                        <div className="pc-hero-actions">
                            <button className="pc-primary-cta" onClick={onTestNow}>TEST NOW <span>→</span></button>
                            <a className="pc-secondary-cta" href="https://github.com/DebugMajor/pigeoncop" target="_blank" rel="noreferrer">VIEW ON GITHUB</a>
                        </div>
                        <div className="pc-hero-meta">
                            <div><strong>V3</strong><span>PIGEON MODEL</span></div>
                            <div><strong>ONNX</strong><span>BROWSER RUNTIME</span></div>
                            <div><strong>WEBGPU</strong><span>LOCAL INFERENCE</span></div>
                        </div>
                    </div>

                    <div className="pc-hero-console">
                        <div className="pc-console-top">
                            <span>MONITORING PREVIEW</span>
                            <span className="pc-console-status"><i /> SYSTEM READY</span>
                        </div>
                        <div className="pc-console-feed">
                            <div className="pc-scan-grid" />
                            <div className="pc-feed-label">CAM 01 / TEST ENVIRONMENT</div>
                            <div className="pc-pigeon-orbit"><div className="pc-pigeon-silhouette">P</div></div>
                            <div className="pc-bbox"><span>PIGEON</span><strong>94%</strong></div>
                            <div className="pc-feed-bottom"><span>MOTION DETECTED</span><span>AI ACTIVE</span><span>ARMED</span></div>
                        </div>
                        <div className="pc-console-data">
                            <div><span>INFERENCE</span><strong>LOCAL</strong></div>
                            <div><span>MODEL</span><strong>V3 / ONNX</strong></div>
                            <div><span>MODE</span><strong>READY</strong></div>
                        </div>
                    </div>
                </section>

                <section className="pc-section" id="how-it-works">
                    <div className="pc-section-heading">
                        <span>01 / HOW IT WORKS</span>
                        <h2>From motion to deterrence.</h2>
                        <p>The monitoring loop is built around cheap motion gating and local AI inference.</p>
                    </div>
                    <div className="pc-process-grid">
                        <article><span>01</span><h3>Detect</h3><p>Frames are sampled from a live camera or local test video and checked for meaningful motion.</p></article>
                        <article><span>02</span><h3>Identify</h3><p>Confirmed motion is passed into browser-based computer vision for pigeon and human detection.</p></article>
                        <article><span>03</span><h3>Deter</h3><p>Confirmed bird events can trigger an audio deterrent, snapshot and event log with cooldown protection.</p></article>
                    </div>
                </section>

                <section className="pc-section pc-system">
                    <div className="pc-section-heading">
                        <span>02 / SYSTEM OVERVIEW</span>
                        <h2>A local-first monitoring pipeline.</h2>
                    </div>
                    <div className="pc-pipeline">
                        <div><small>INPUT</small><strong>CAMERA / VIDEO</strong></div><b>→</b>
                        <div><small>GATE</small><strong>MOTION</strong></div><b>→</b>
                        <div><small>AI</small><strong>YOLO / MEDIAPIPE</strong></div><b>→</b>
                        <div><small>CONFIRM</small><strong>TEMPORAL FILTER</strong></div><b>→</b>
                        <div><small>RESPONSE</small><strong>SNAPSHOT + DETERRENT</strong></div>
                    </div>
                </section>

                <section className="pc-section">
                    <div className="pc-section-heading">
                        <span>03 / CAPABILITIES</span>
                        <h2>Built for a real demo, not a mock dashboard.</h2>
                    </div>
                    <div className="pc-feature-grid">
                        <article><strong>Real-time monitoring</strong><p>Live camera and prerecorded Test Video modes share the same detection pipeline.</p></article>
                        <article><strong>Browser AI</strong><p>ONNX inference with WebGPU keeps the primary loop on-device.</p></article>
                        <article><strong>Event intelligence</strong><p>Temporal confirmation, duplicate suppression and deterrent cooldown reduce noisy events.</p></article>
                        <article><strong>Evidence</strong><p>Detection snapshots and activity logs make the system easy to demonstrate and inspect.</p></article>
                    </div>
                </section>

                <section className="pc-section pc-tech" id="technology">
                    <div>
                        <span>04 / TECHNOLOGY</span>
                        <h2>Edge AI, in the browser.</h2>
                        <p>PigeonCop combines React, Canvas APIs, MediaPipe, YOLO, ONNX and WebGPU without requiring a cloud backend for the current MVP.</p>
                    </div>
                    <div className="pc-tech-stack">
                        <span>REACT</span><span>VITE</span><span>YOLO</span><span>ONNX</span>
                        <span>WEBGPU</span><span>MEDIAPIPE</span><span>CANVAS API</span>
                    </div>
                </section>

                <section className="pc-final-cta">
                    <div><span>READY WHEN YOU ARE</span><h2>Run the monitor.</h2></div>
                    <button className="pc-primary-cta" onClick={onTestNow}>OPEN MONITOR <span>→</span></button>
                </section>
            </main>

            <footer className="pc-home-footer">
                <span>PigeonCop</span><span>Detect • Deter • Protect</span><span>Local-first computer vision</span>
            </footer>
        </div>
    );
}
export default HomePage;
