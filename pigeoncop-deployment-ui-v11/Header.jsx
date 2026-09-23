function Header({ status }) {
    return (
        <header className="pcd-header">
            <div className="pcd-header-inner">
                <a className="pcd-brand" href="/" aria-label="PigeonCop home">
                    <img src="/logo-wordmark.png" alt="PigeonCop" />
                </a>

                <div className="pcd-brand-context">
                    <span>EDGE AI</span>
                    <i />
                    <span>LOCAL INFERENCE</span>
                    <i />
                    <span>REAL-TIME</span>
                </div>

                <div className="pcd-header-status">
                    <i />
                    <span>{status === "active" ? "SYSTEM ACTIVE" : "SYSTEM READY"}</span>
                </div>
            </div>
        </header>
    );
}

export default Header;
