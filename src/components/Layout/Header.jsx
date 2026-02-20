import './Header.css';

export function Header() {
    const system = {
        overallHealth: 98,
        internetStatus: 'stable',
        maxDrift: 0.2,
        fieldDistortion: 1.2
    };

    const getHealthColor = () => {
        if (system.overallHealth > 70) return 'var(--success-green)';
        if (system.overallHealth > 40) return 'var(--warning-amber)';
        return 'var(--critical-red)';
    };

    const getInternetStatusIcon = () => {
        switch (system.internetStatus) {
            case 'stable': return '◉';
            case 'flickering': return '◎';
            case 'offline': return '○';
            default: return '◉';
        }
    };

    return (
        <header className="dashboard-header">
            <div className="header-brand">
                <div className="brand-logo">
                    <svg viewBox="0 0 40 40" className="logo-icon">
                        <defs>
                            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--electric-cyan)" />
                                <stop offset="100%" stopColor="var(--neon-purple)" />
                            </linearGradient>
                        </defs>
                        <circle cx="20" cy="20" r="18" fill="none" stroke="url(#logoGradient)" strokeWidth="2" />
                        <circle cx="20" cy="20" r="12" fill="none" stroke="url(#logoGradient)" strokeWidth="1.5" />
                        <circle cx="20" cy="20" r="6" fill="url(#logoGradient)" />
                        <path d="M20 2 L20 8 M20 32 L20 38 M2 20 L8 20 M32 20 L38 20"
                            stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
                <div className="brand-text">
                    <h1 className="brand-name">Thunderstorm</h1>
                    <span className="brand-subtitle">Neo-Dhaka Residential Spire</span>
                </div>
            </div>

            <div className="header-status">
                <div className="status-item">
                    <span className="status-label">System Health</span>
                    <div className="health-bar">
                        <div
                            className="health-fill"
                            style={{
                                width: `${system.overallHealth}%`,
                                backgroundColor: getHealthColor()
                            }}
                        />
                    </div>
                    <span className="status-value" style={{ color: getHealthColor() }}>
                        {system.overallHealth.toFixed(0)}%
                    </span>
                </div>

                <div className="status-item">
                    <span className="status-label">Drift</span>
                    <span className="status-value">
                        {system.maxDrift.toFixed(1)}°
                    </span>
                </div>

                <div className="status-item">
                    <span className="status-label">Signal Clarity</span>
                    <span className="status-value">
                        {(100 - system.fieldDistortion).toFixed(1)}%
                    </span>
                </div>

                <div className="status-item network-status">
                    <span className="status-label">Network</span>
                    <span className={`status-value network ${system.internetStatus}`}>
                        {getInternetStatusIcon()} {system.internetStatus}
                    </span>
                </div>
            </div>

            <div className="header-actions">
                <button className="emergency-btn">
                    <span className="btn-icon">⚡</span>
                    <span className="btn-text">EMERGENCY RESET</span>
                </button>
            </div>
        </header>
    );
}
