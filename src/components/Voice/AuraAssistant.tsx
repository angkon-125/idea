import { useEffect, useCallback } from 'react';
import { useGravity } from '../../context/GravityContext';
import { useVoiceRecognition, parseAuraCommand, type AuraCommand } from '../../hooks/useVoiceRecognition';
import { useSpeechSynthesis, generateAuraResponse } from '../../hooks/useSpeechSynthesis';
import './AuraAssistant.css';

export function AuraAssistant() {
    const { state, stabilizeFloor, emergencyStabilize, addLog, dispatch } = useGravity();
    const { system, auraResponse } = state;

    const {
        isListening,
        isSupported: voiceSupported,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript
    } = useVoiceRecognition();

    const { speak, isSpeaking } = useSpeechSynthesis();

    const handleCommand = useCallback((command: AuraCommand) => {
        addLog('info', `Radio Command: ${command.action}`, 'AURA');

        const context = {
            overallHealth: system.overallHealth,
            criticalFloors: system.criticalFloors,
            avgDrift: system.avgDrift,
            maxDrift: system.maxDrift,
        };

        let response = '';

        switch (command.action) {
            case 'stabilize':
                if (typeof command.target === 'number') {
                    stabilizeFloor(command.target);
                    response = `Initiating stabilization for floor ${command.target}. Correction sequence engaged.`;
                    addLog('info', `AURA: Stabilizing Floor ${command.target}`, 'VoiceAI');
                } else {
                    response = 'Please specify a floor number to stabilize.';
                }
                break;

            case 'emergency':
                emergencyStabilize();
                response = generateAuraResponse('emergency', context);
                addLog('warning', 'AURA: Emergency stabilization activated', 'VoiceAI');
                break;

            case 'status':
                response = generateAuraResponse('status', context);
                addLog('info', 'AURA: Status report requested', 'VoiceAI');
                break;

            case 'analyze':
                response = generateAuraResponse('analyze', context);
                addLog('info', 'AURA: Diagnostic analysis initiated', 'VoiceAI');
                break;

            case 'float':
                // AURA, find me [genre] stations in [location] and float them to the center
                const floatLocation = command.raw.match(/in\s+([a-zA-Z\s]+)/)?.[1];
                const floatGenre = command.raw.match(/find\s+me\s+([a-zA-Z\s]+)\s+stations/)?.[1];

                dispatch({ type: 'FLOAT_STATIONS', payload: { genre: floatGenre, location: floatLocation } });
                response = `Adjusting aether fields. Floating ${floatGenre || 'relevant'} anchors from ${floatLocation || 'all sectors'} to the central gravity well.`;
                addLog('info', `AURA: Floating stations - ${floatGenre} in ${floatLocation}`, 'VoiceAI');
                break;

            case 'help':
                response = generateAuraResponse('help', context);
                break;

            default:
                response = `I didn't understand "${command.raw}". Say "help" for available commands.`;
        }

        dispatch({ type: 'SET_AURA_RESPONSE', payload: response });
        speak(response);
    }, [system, stabilizeFloor, emergencyStabilize, addLog, speak, dispatch]);

    useEffect(() => {
        if (transcript && !isListening) {
            const command = parseAuraCommand(transcript);
            handleCommand(command);
            resetTranscript();
        }
    }, [transcript, isListening, handleCommand, resetTranscript]);

    if (!voiceSupported) {
        return (
            <div className="aura-container radio-transceiver glass-panel">
                <div className="aura-unavailable">
                    <span className="unavailable-icon">📻</span>
                    <p>Voice comms not supported in this sector</p>
                </div>
            </div>
        );
    }

    return (
        <div className="aura-container radio-transceiver glass-panel">
            <div className="panel-header">
                <h2 className="panel-title">
                    <span className="title-icon">📻</span>
                    AURA Comms Unit
                </h2>
                <span className={`comms-status ${isListening ? 'tx' : isSpeaking ? 'rx' : 'standby'}`}>
                    {isListening ? 'TX' : isSpeaking ? 'RX' : 'STBY'}
                </span>
            </div>

            <div className="radio-faceplate">
                <div className="vu-meter">
                    <div className="vu-label">MODULATION</div>
                    <div className="vu-scale">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div
                                key={i}
                                className={`vu-bar ${(isListening || isSpeaking) ? 'active' : ''}`}
                                style={{
                                    animationDelay: `${i * 0.05}s`,
                                    opacity: i > 8 ? 0.3 : 0.8
                                }}
                            />
                        ))}
                    </div>
                </div>

                <button
                    className={`ptt-button ${isListening ? 'active' : ''}`}
                    onMouseDown={startListening}
                    onMouseUp={stopListening}
                    onMouseLeave={stopListening}
                    onTouchStart={startListening}
                    onTouchEnd={stopListening}
                >
                    <div className="ptt-label">PUSH TO TALK</div>
                    <div className="ptt-indicator" />
                </button>

                <div className="comms-panel-details">
                    <div className="detail-item">
                        <span className="label">BAND:</span>
                        <span className="value">UHF-NEO</span>
                    </div>
                    <div className="detail-item">
                        <span className="label">SQL:</span>
                        <span className="value">AUTO</span>
                    </div>
                </div>
            </div>

            {(interimTranscript || transcript) && (
                <div className="incoming-comms-text">
                    <span className="comms-prefix">{isListening ? '>> ME:' : '>> AURA:'}</span>
                    <span className="text-content">
                        {interimTranscript || transcript}
                    </span>
                </div>
            )}

            {auraResponse && (
                <div className="radio-response">
                    <div className="response-header">INCOMING TRANS:</div>
                    <div className="response-text">{auraResponse}</div>
                </div>
            )}
        </div>
    );
}
