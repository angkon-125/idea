import { useState, useCallback, useEffect } from 'react';
import { useVoiceRecognition, parseAuraCommand } from '../../hooks/useVoiceRecognition';
import { useSpeechSynthesis, generateAuraResponse } from '../../hooks/useSpeechSynthesis';
import './AuraAssistant.css';

export function AuraAssistant() {
    const [auraResponse, setAuraResponse] = useState('');

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

    const addLog = (type, message, source) => {
        console.log(`[${source}] ${type}: ${message}`);
    };

    const handleCommand = useCallback((command) => {
        addLog('info', `Radio Command: ${command.action}`, 'AURA');

        const system = { overallHealth: 98, criticalFloors: [], avgDrift: 0.1, maxDrift: 0.2 };

        const context = {
            overallHealth: system.overallHealth,
            criticalFloors: system.criticalFloors,
            avgDrift: system.avgDrift,
            maxDrift: system.maxDrift,
        };

        let response = '';

        switch (command.action) {
            case 'emergency':
                response = "Initiating emergency system reset. All modules recalibrating.";
                addLog('warning', 'AURA: Emergency reset activated', 'VoiceAI');
                break;

            case 'status':
                response = generateAuraResponse('status', context);
                addLog('info', 'AURA: Status report requested', 'VoiceAI');
                break;

            case 'analyze':
                response = generateAuraResponse('analyze', context);
                addLog('info', 'AURA: Diagnostic analysis initiated', 'VoiceAI');
                break;

            case 'help':
                response = "I can provide status reports, perform diagnostics, or initiate emergency resets. Say 'status' or 'analyze'.";
                break;

            default:
                response = `I didn't understand "${command.raw}". Say "help" for available commands.`;
        }

        setAuraResponse(response);
        speak(response);
    }, [speak]);

    useEffect(() => {
        if (transcript && !isListening) {
            const command = parseAuraCommand(transcript);
            // Use a small delay or microtask to avoid the synchronous state update warning
            setTimeout(() => {
                handleCommand(command);
                resetTranscript();
            }, 0);
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
