import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSpeechSynthesisReturn {
    speak: (text: string) => void;
    cancel: () => void;
    isSpeaking: boolean;
    isSupported: boolean;
    voices: SpeechSynthesisVoice[];
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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

    const speak = useCallback((text: string) => {
        if (!isSupported) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Find a suitable voice (prefer female voices for AURA)
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
    action: string,
    context: {
        overallHealth: number;
        criticalFloors: number[];
        avgDrift: number;
        maxDrift: number;
    }
): string {
    switch (action) {
        case 'status':
            if (context.overallHealth > 80) {
                return `System health is at ${context.overallHealth} percent. All gravitational fields are operating within normal parameters.`;
            } else if (context.overallHealth > 50) {
                return `Warning. System health at ${context.overallHealth} percent. ${context.criticalFloors.length} floors showing critical drift levels. Average drift is ${context.avgDrift.toFixed(1)} degrees.`;
            } else {
                return `Alert! System health critical at ${context.overallHealth} percent. Maximum drift detected at ${context.maxDrift.toFixed(1)} degrees. Immediate stabilization recommended.`;
            }

        case 'stabilize':
            return `Initiating stabilization sequence. Anti-gravity field recalibration in progress.`;

        case 'emergency':
            return `Emergency protocol activated. Engaging all stabilizers. Please hold steady.`;

        case 'analyze':
            return `Running diagnostic scan. Analyzing hook memory allocation and garbage collection patterns. Memory leak probability assessment in progress.`;

        case 'help':
            return `Available commands: Say "status report" for system overview. "Stabilize floor" followed by a number to correct drift. "Emergency stabilize" for all floors. "Analyze" to run diagnostics.`;

        default:
            return `Command not recognized. Say "help" for available commands.`;
    }
}
