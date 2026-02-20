import { useState } from 'react';
import './RadioTuner.css';

export function RadioTuner() {
    const [system, setSystem] = useState({
        signalStrength: 85,
        activeChannel: 'COMMS',
        currentFrequency: 440.0
    });

    const handleFrequencyChange = (e) => {
        const freq = parseFloat(e.target.value);
        setSystem(prev => ({ ...prev, currentFrequency: freq }));
    };

    const handleChannelChange = (channel) => {
        setSystem(prev => ({ ...prev, activeChannel: channel }));
    };

    return (
        <div className="radio-tuner glass-panel hardware-textured">
            <div className="radio-screen">
                <div className="screen-header">
                    <span className="signal-indicator">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className={`signal-bar ${i < Math.floor(system.signalStrength / 20) ? 'active' : ''}`}
                            />
                        ))}
                        <span className="signal-label">SIGNAL</span>
                    </span>
                    <span className="channel-display">{system.activeChannel}</span>
                </div>

                <div className="frequency-readout">
                    <span className="freq-value">{system.currentFrequency.toFixed(1)}</span>
                    <span className="freq-unit">MHz</span>
                </div>

                <div className="screen-footer">
                    <span className="mode-label">THUNDERSTORM COMM-SYNC</span>
                    <span className="encryption-status">ENC: AES-256-NEO</span>
                </div>
            </div>

            <div className="tuner-controls">
                <div className="tuner-knob-container">
                    <input
                        type="range"
                        min="400"
                        max="500"
                        step="0.1"
                        value={system.currentFrequency}
                        onChange={handleFrequencyChange}
                        className="frequency-slider"
                    />
                    <div className="knob-labels">
                        <span>400</span>
                        <span>450</span>
                        <span>500</span>
                    </div>
                </div>

                <div className="channel-buttons">
                    {['SENSOR_FEED', 'COMMS', 'EMERGENCY', 'DIAGNOSTIC'].map((ch) => (
                        <button
                            key={ch}
                            className={`channel-btn ${system.activeChannel === ch ? 'active' : ''}`}
                            onClick={() => handleChannelChange(ch)}
                        >
                            {ch.split('_')[0]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="hardware-details">
                <div className="grill-texture" />
                <div className="screw screw-tl" />
                <div className="screw screw-tr" />
                <div className="screw screw-bl" />
                <div className="screw screw-br" />
            </div>
        </div>
    );
}
