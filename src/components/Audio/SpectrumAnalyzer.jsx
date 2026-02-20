import { useEffect, useRef, useState } from 'react';
import { useAudioAnalyzer } from '../../hooks/useAudioAnalyzer';
import './SpectrumAnalyzer.css';

export function SpectrumAnalyzer() {
    const canvasRef = useRef(null);
    const [system] = useState({ currentFrequency: 440.0 });

    const {
        frequencyData,
        distortionLevel,
        isActive,
        startAnalyzer,
        stopAnalyzer,
        setDistance,
        isSupported,
    } = useAudioAnalyzer();

    // Default distance
    useEffect(() => {
        if (!isActive) return;
        setDistance(100);
    }, [isActive, setDistance]);

    // Draw spectrum visualization
    useEffect(() => {
        if (!canvasRef.current || !isActive) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;

            ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
            ctx.fillRect(0, 0, width, height);

            const barCount = frequencyData.length;
            const barWidth = width / barCount;
            const barGap = 2;

            for (let i = 0; i < barCount; i++) {
                const value = frequencyData[i] / 255;
                const barHeight = value * height * 0.9;
                const x = i * barWidth;
                const y = height - barHeight;

                let hue;
                if (value > 0.8) {
                    hue = 0;
                } else if (value > 0.5) {
                    hue = 30;
                } else {
                    hue = 180 + (i / barCount) * 60;
                }

                const gradient = ctx.createLinearGradient(x, height, x, y);
                gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.8)`);
                gradient.addColorStop(1, `hsla(${hue}, 100%, 70%, 0.4)`);

                ctx.fillStyle = gradient;
                ctx.fillRect(x + barGap / 2, y, barWidth - barGap, barHeight);

                if (value > 0.6) {
                    ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
                    ctx.shadowBlur = 10;
                    ctx.fillRect(x + barGap / 2, y, barWidth - barGap, barHeight);
                    ctx.shadowBlur = 0;
                }
            }

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

    const toggleAudio = async () => {
        if (isActive) {
            stopAnalyzer();
        } else {
            await startAnalyzer();
        }
    };

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
                            <span>Activate Spectrum Monitoring</span>
                        </button>
                        <p className="activate-hint">Monitor signal interference and harmonics</p>
                    </div>
                )}
            </div>

            <div className="distortion-meter">
                <div className="meter-header">
                    <span className="meter-label">Signal Jitter</span>
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
                    <span>High jitter detected in signal!</span>
                </div>
            )}
        </div>
    );
}
