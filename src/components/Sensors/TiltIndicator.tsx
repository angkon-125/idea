import { useGravity } from '../../context/GravityContext';
import './TiltIndicator.css';

interface TiltIndicatorProps {
    tiltX: number;
    tiltY: number;
    maxTilt?: number;
}

export function TiltIndicator({ tiltX, tiltY, maxTilt = 20 }: TiltIndicatorProps) {
    // Clamp values
    const clampedX = Math.max(-maxTilt, Math.min(maxTilt, tiltX));
    const clampedY = Math.max(-maxTilt, Math.min(maxTilt, tiltY));

    // Calculate severity
    const magnitude = Math.sqrt(clampedX ** 2 + clampedY ** 2);
    const severity = magnitude > 12 ? 'critical' : magnitude > 6 ? 'warning' : 'stable';

    return (
        <div className="tilt-indicator-container">
            <div className="tilt-visualizer">
                <div className="tilt-grid">
                    {/* Grid lines */}
                    <div className="grid-line horizontal" />
                    <div className="grid-line vertical" />
                    <div className="grid-circle outer" />
                    <div className="grid-circle middle" />
                    <div className="grid-circle inner" />
                </div>

                {/* Tilt platform */}
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

                {/* Indicator dot showing actual position */}
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
    const { state } = useGravity();
    const { floors, selectedFloor, system } = state;

    // Get the selected floor or use overall average
    const displayFloor = selectedFloor
        ? floors.find(f => f.floor === selectedFloor)
        : null;

    const avgTiltX = floors.reduce((sum, f) => sum + f.tiltX, 0) / floors.length;
    const avgTiltY = floors.reduce((sum, f) => sum + f.tiltY, 0) / floors.length;

    return (
        <div className="sensor-panel glass-panel">
            <div className="panel-header">
                <h2 className="panel-title">
                    <span className="title-icon">📡</span>
                    {selectedFloor ? `Floor ${selectedFloor} Sensor` : 'System Tilt Overview'}
                </h2>
            </div>

            <TiltIndicator
                tiltX={displayFloor?.tiltX ?? avgTiltX}
                tiltY={displayFloor?.tiltY ?? avgTiltY}
            />

            <div className="sensor-stats">
                <div className="stat-row">
                    <span className="stat-label">Active Sensors</span>
                    <span className="stat-value">{system.activeSensors}</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Critical Floors</span>
                    <span className="stat-value critical">{system.criticalFloors.length}</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Warning Floors</span>
                    <span className="stat-value warning">{system.warningFloors.length}</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">Field Frequency</span>
                    <span className="stat-value">{system.fieldFrequency.toFixed(1)} Hz</span>
                </div>
            </div>
        </div>
    );
}
