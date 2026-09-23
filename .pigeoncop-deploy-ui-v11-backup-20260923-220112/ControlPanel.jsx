import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faStop, faVolumeHigh, faRotateRight, faUpload } from "@fortawesome/free-solid-svg-icons";

function ControlPanel({
    status,
    setStatus,
    onTestDetection,
    sourceMode,
    setSourceMode,
    onResetTest,
    onTogglePlayback,
    testVideoPlaying,
    deterrentSound,
    deterrentSounds,
    setDeterrentSound,
    selectedSoundLabel,
    testVideoFile,
    onVideoSelect,
    testSoundPlaying,
}) {
    const handleVideoSelect = (event) => {
        const file = event.target.files?.[0] ?? null;
        if (file) onVideoSelect(file);
        event.target.value = "";
    };

    return (
        <section className="control-panel">
            <div className="control-copy">
                <span className="section-kicker">CONTROL</span>
                <h2>Monitoring Controls</h2>
                <p>Manage the live camera session and deterrent response.</p>
            </div>

            <div className="source-selector">
                <span className="section-kicker">SOURCE</span>
                <div className="source-options">
                    <button type="button" className={`source-option ${sourceMode === "live" ? "active" : ""}`} disabled={status === "active" || status === "loading"} onClick={() => setSourceMode("live")}>Live Camera</button>
                    <button type="button" className={`source-option ${sourceMode === "test" ? "active" : ""}`} disabled={status === "active" || status === "loading"} onClick={() => setSourceMode("test")}>Test Video</button>
                </div>

                {sourceMode === "test" && (
                    <div className="test-video-picker">
                        <label className="test-video-button">
                            <FontAwesomeIcon icon={faUpload} />
                            <span>{testVideoFile ? "Change Video" : "Choose Video"}</span>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleVideoSelect}
                                disabled={status === "active" || status === "loading"}
                            />
                        </label>
                        <span className="test-video-name" title={testVideoFile?.name || "Built-in demo video"}>
                            {testVideoFile ? testVideoFile.name : "Built-in demo"}
                        </span>
                    </div>
                )}
            </div>

            <label className="deterrent-selector">
                <span className="section-kicker">DETERRENT SOUND</span>
                <select className="deterrent-select" value={deterrentSound} onChange={(event) => setDeterrentSound(event.target.value)} title={`Selected: ${selectedSoundLabel}`}>
                    {Object.entries(deterrentSounds).map(([key, sound]) => (
                        <option key={key} value={key}>{sound.label}</option>
                    ))}
                </select>
            </label>

            <div className="control-actions">
                <button type="button" className="action-button action-primary" disabled={status === "active" || status === "loading"} onClick={() => setStatus("loading")}>
                    <FontAwesomeIcon icon={faPlay} /><span>Start Monitoring</span>
                </button>
                <button type="button" className="action-button action-secondary" disabled={status === "offline" || status === "error"} onClick={() => setStatus("stopping")}>
                    <FontAwesomeIcon icon={faStop} /><span>Stop</span>
                </button>
                {sourceMode === "test" && status === "active" && (
                    <button type="button" className="action-button action-secondary" onClick={onTogglePlayback}>
                        <FontAwesomeIcon icon={testVideoPlaying ? faPause : faPlay} /><span>{testVideoPlaying ? "Pause" : "Play"}</span>
                    </button>
                )}
                <button type="button" className={`action-button action-tertiary ${testSoundPlaying ? "sound-playing" : ""}`} onClick={onTestDetection}>
                    <FontAwesomeIcon icon={testSoundPlaying ? faStop : faVolumeHigh} /><span>{testSoundPlaying ? "Stop Sound" : "Test Sound"}</span>
                </button>
                {sourceMode === "test" && (
                    <button type="button" className="action-button action-secondary" onClick={onResetTest} disabled={status !== "active"}>
                        <FontAwesomeIcon icon={faRotateRight} /><span>Reset Test</span>
                    </button>
                )}
            </div>
        </section>
    );
}

export default ControlPanel;
