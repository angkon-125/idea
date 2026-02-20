import { useState, useCallback, useRef, useEffect } from 'react';

export function useSpeechSynthesis() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState([]);
    const utteranceRef = useRef(null);

    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    useEffect(() => {
        if (!isSupported) return;

        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.cancel();
        };
    }, [isSupported]);

    const speak = useCallback((text) => {
        if (!isSupported) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        const preferredVoice = voices.find(v =>
            v.name.includes('Samantha') ||
            v.name.includes('Google UK English Female') ||
            v.name.includes('Microsoft Zira') ||
            v.name.includes('Female')
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.rate = 1.1;
        utterance.pitch = 1.1;
        utterance.volume = 0.9;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [isSupported, voices]);

    const cancel = useCallback(() => {
        if (!isSupported) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, [isSupported]);

    return {
        speak,
        cancel,
        isSpeaking,
        isSupported,
        voices,
    };
}

// AURA Response Generator
export function generateAuraResponse(
    action,
    context
) {
    switch (action) {
        case 'status':
            return `System health is at ${context.overallHealth} percent. All modules are operating within normal parameters.`;

        case 'emergency':
            return `Emergency protocol activated. Engaging all safety resets. Please standby.`;

        case 'analyze':
            return `Running diagnostic scan. Analyzing core data streams and network stability. Diagnostic complete.`;

        case 'help':
            return `Available commands: Say "status report" for system overview. "Analyze" to run diagnostics. "Emergency reset" for system reset.`;

        default:
            return `Command not recognized. Say "help" for available commands.`;
    }
}
