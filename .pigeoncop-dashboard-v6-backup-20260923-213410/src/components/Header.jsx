function Header({ status }) {
    return (
        <header className="topbar">
            <div className="topbar-inner">
                <a className="brand" href="/" aria-label="PigeonCop home">
                    <img
                        src="/logo-wordmark.png"
                        alt="PigeonCop"
                        className="brand-logo"
                    />
                </a>

                <div className="brand-context">
                    <span>EDGE AI</span>
                    <i />
                    <span>LOCAL INFERENCE</span>
                    <i />
                    <span>REAL-TIME</span>
                </div>

                <div className="topbar-status">
                    <span className={`session-dot ${status === "active" ? "is-live" : ""}`} />
                    <span>{status === "active" ? "SYSTEM ACTIVE" : "SYSTEM READY"}</span>
                </div>
            </div>
        </header>
    );
}

export default Header;
