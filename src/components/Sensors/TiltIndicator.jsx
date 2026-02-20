import './TiltIndicator.css';

export function TiltIndicator({ tiltX, tiltY, maxTilt = 20 }) {
    const clampedX = Math.max(-maxTilt, Math.min(maxTilt, tiltX));
    const clampedY = Math.max(-maxTilt, Math.min(maxTilt, tiltY));

    const magnitude = Math.sqrt(clampedX ** 2 + clampedY ** 2);
    const severity = magnitude > 12 ? 'critical' : magnitude > 6 ? 'warning' : 'stable';

    return (
        <div className="tilt-indicator-container">
            <div className="tilt-visualizer">
                <div className="tilt-grid">
                    <div className="grid-line horizontal" />
                    <div className="grid-line vertical" />
                    <div className="grid-circle outer" />
                    <div className="grid-circle middle" />
                    <div className="grid-circle inner" />
                </div>

                <div
                    className={`tilt-platform ${severity}`}
                    style={{
                        transform: `perspective(200px) rotateX(${-clampedY * 2}deg) rotateY(${clampedX * 2}deg)`
                    }}
                >
                    <div className="platform-surface">
                        <div className="platform-center" />
                    </div>
                </div>

                <div
                    className={`tilt-dot ${severity}`}
                    style={{
                        left: `${50 + (clampedX / maxTilt) * 40}%`,
                        top: `${50 + (clampedY / maxTilt) * 40}%`
                    }}
                />
            </div>

            <div className="tilt-readings">
                <div className="reading">
                    <span className="reading-label">X</span>
                    <span className={`reading-value ${severity}`}>{tiltX.toFixed(1)}°</span>
                </div>
                <div className="reading">
                    <span className="reading-label">Y</span>
                    <span className={`reading-value ${severity}`}>{tiltY.toFixed(1)}°</span>
                </div>
                <div className="reading magnitude">
                    <span className="reading-label">MAG</span>
                    <span className={`reading-value ${severity}`}>{magnitude.toFixed(1)}°</span>
                </div>
            </div>
        </div>
    );
}

export function SensorPanel() {
    const system = {
        activeSensors: 142,
        criticalFloors: [],
        warningFloors: [],
        fieldFrequency: 440.0
    };

    return (
        <div className="sensor-panel glass-panel">
            <div className="panel-header">
                <h2 className="panel-title">
                    <span className="title-icon">📡</span>
                    System Static Precision
                </h2>
            </div>

            <TiltIndicator
                tiltX={0.1}
                tiltY={-0.2}
            />

            <div className="sensor-stats">
                <div className="stat-row">
                    <span className="stat-label">Active Sensors</span>
                    <span className="stat-value">{system.activeSensors}</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Stability</span>
                    <span className="stat-value">NORMAL</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Signal Bias</span>
                    <span className="stat-value">CALIBRATED</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Main Freq</span>
                    <span className="stat-value">{system.fieldFrequency.toFixed(1)} Hz</span>
                </div>
            </div>
        </div>
    );
}
