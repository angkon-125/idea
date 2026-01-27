import { useEffect, useRef } from 'react';
import { useAudioAnalyzer } from '../../hooks/useAudioAnalyzer';
import { useGravity } from '../../context/GravityContext';
import './SpectrumAnalyzer.css';

export function SpectrumAnalyzer() {
    const { state, dispatch, addLog } = useGravity();
    const { system } = state;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const {
        frequencyData,
        distortionLevel,
        isActive,
        startAnalyzer,
        stopAnalyzer,
        setDistance,
        isSupported,
    } = useAudioAnalyzer();

    // Update audio spatialization based on selected station distance
    useEffect(() => {
        if (!isActive) return;

        if (state.activeStationId) {
            const station = state.stations.find(s => s.id === state.activeStationId);
            if (station) {
                // Calculate distance in 3D space
                const dist = Math.sqrt(
                    Math.pow(station.x - state.userPosition.x, 2) +
                    Math.pow(station.y - state.userPosition.y, 2) +
                    Math.pow(station.z - state.userPosition.z, 2)
                );
                setDistance(dist);
            }
        } else {
            // Default maximum distance/noise when no station selected
            setDistance(500);
        }
    }, [state.activeStationId, state.stations, state.userPosition, isActive, setDistance]);

    // Draw spectrum visualization
    useEffect(() => {
        if (!canvasRef.current || !isActive) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;

            // Clear canvas
            ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
            ctx.fillRect(0, 0, width, height);

            // Draw frequency bars
            const barCount = frequencyData.length;
            const barWidth = width / barCount;
            const barGap = 2;

            for (let i = 0; i < barCount; i++) {
                const value = frequencyData[i] / 255;
                const barHeight = value * height * 0.9;
                const x = i * barWidth;
                const y = height - barHeight;

                // Color based on frequency and amplitude
                let hue: number;
                if (value > 0.8) {
                    hue = 0; // Red for high amplitude
                } else if (value > 0.5) {
                    hue = 30; // Orange/yellow
                } else {
                    hue = 180 + (i / barCount) * 60; // Cyan to blue gradient
                }

                const gradient = ctx.createLinearGradient(x, height, x, y);
                gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.8)`);
                gradient.addColorStop(1, `hsla(${hue}, 100%, 70%, 0.4)`);

                ctx.fillStyle = gradient;
                ctx.fillRect(x + barGap / 2, y, barWidth - barGap, barHeight);

                // Glow effect for high values
                if (value > 0.6) {
                    ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
                    ctx.shadowBlur = 10;
                    ctx.fillRect(x + barGap / 2, y, barWidth - barGap, barHeight);
                    ctx.shadowBlur = 0;
                }
            }

            // Draw threshold line
            const thresholdY = height * 0.3;
            ctx.strokeStyle = 'rgba(255, 51, 85, 0.5)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(0, thresholdY);
            ctx.lineTo(width, thresholdY);
            ctx.stroke();
            ctx.setLineDash([]);

            if (isActive) {
                requestAnimationFrame(draw);
            }
        };

        draw();
    }, [frequencyData, isActive]);

    // Handle audio toggle
    const toggleAudio = async () => {
        if (isActive) {
            stopAnalyzer();
            dispatch({ type: 'UPDATE_SYSTEM', payload: { audioMonitoringActive: false } });
            addLog('info', 'Field audio monitoring deactivated', 'AudioDiagnostics');
        } else {
            await startAnalyzer();
            dispatch({ type: 'UPDATE_SYSTEM', payload: { audioMonitoringActive: true } });
            addLog('info', 'Field audio monitoring activated - Listening to anti-grav field harmonics', 'AudioDiagnostics');
        }
    };

    // Distortion warning
    useEffect(() => {
        if (distortionLevel > 20) {
            addLog('warning', `High field distortion detected: ${distortionLevel.toFixed(1)}%`, 'AudioDiagnostics');
        }
    }, [distortionLevel > 20]);

    if (!isSupported) {
        return (
            <div className="spectrum-container glass-panel">
                <div className="audio-unavailable">
                    <span className="unavailable-icon">🔊</span>
                    <p>Web Audio API not supported</p>
                </div>
            </div>
        );
    }

    return (
        <div className="spectrum-container glass-panel">
            <div className="panel-header">
                <h2 className="panel-title">
                    <span className="title-icon">📡</span>
                    Signal Spectrum Analyzer
                </h2>
                <div className="radio-metrics">
                    <span className="metric">BW: 250kHz</span>
                    <span className="metric">SNR: 42dB</span>
                </div>
                <button
                    className={`audio-toggle ${isActive ? 'active' : ''}`}
                    onClick={toggleAudio}
                >
                    {isActive ? '● MONITORING' : '○ STANDBY'}
                </button>
            </div>

            <div className="spectrum-display">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={150}
                    className="spectrum-canvas"
                />
                {!isActive && (
                    <div className="spectrum-overlay">
                        <button className="activate-btn" onClick={toggleAudio}>
                            <span className="btn-icon">🔊</span>
                            <span>Activate Field Monitoring</span>
                        </button>
                        <p className="activate-hint">Listen to the anti-gravity field harmonics</p>
                    </div>
                )}
            </div>

            <div className="distortion-meter">
                <div className="meter-header">
                    <span className="meter-label">Field Distortion</span>
                    <span className={`meter-value ${distortionLevel > 15 ? 'critical' : distortionLevel > 10 ? 'warning' : ''}`}>
                        {distortionLevel.toFixed(1)}%
                    </span>
                </div>
                <div className="meter-bar">
                    <div
                        className={`meter-fill ${distortionLevel > 15 ? 'critical' : distortionLevel > 10 ? 'warning' : ''}`}
                        style={{ width: `${Math.min(100, distortionLevel * 4)}%` }}
                    />
                    <div className="meter-threshold" style={{ left: '60%' }} title="Warning threshold" />
                    <div className="meter-threshold critical" style={{ left: '80%' }} title="Critical threshold" />
                </div>
            </div>

            <div className="audio-stats radio-stats">
                <div className="stat">
                    <span className="stat-label">CENTER FREQ</span>
                    <span className="stat-value">{system.currentFrequency.toFixed(3)} MHz</span>
                </div>
                <div className="stat">
                    <span className="stat-label">MODULATION</span>
                    <span className="stat-value">FM-GMSK</span>
                </div>
                <div className="stat">
                    <span className="stat-label">RF GAIN</span>
                    <span className="stat-value">AUTO</span>
                </div>
            </div>


            {distortionLevel > 15 && (
                <div className="distortion-warning">
                    <span className="warning-icon">⚠️</span>
                    <span>High distortion detected! Field collapse risk elevated.</span>
                </div>
            )}
        </div>
    );
}
