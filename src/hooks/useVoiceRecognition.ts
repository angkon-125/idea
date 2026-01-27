import { useState, useEffect, useCallback, useRef } from 'react';

interface UseVoiceRecognitionReturn {
    isListening: boolean;
    isSupported: boolean;
    transcript: string;
    interimTranscript: string;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

export function useVoiceRecognition(): UseVoiceRecognitionReturn {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const isSupported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    useEffect(() => {
        if (!isSupported) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            setError(event.error);
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let currentInterim = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    currentInterim += result[0].transcript;
                }
            }

            if (finalTranscript) {
                setTranscript(prev => prev + ' ' + finalTranscript);
            }
            setInterimTranscript(currentInterim);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, [isSupported]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            setInterimTranscript('');
            try {
                recognitionRef.current.start();
            } catch (e) {
                // Already started
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    return {
        isListening,
        isSupported,
        transcript: transcript.trim(),
        interimTranscript,
        error,
        startListening,
        stopListening,
        resetTranscript,
    };
}

// Command parser for AURA
export interface AuraCommand {
    action: 'stabilize' | 'status' | 'emergency' | 'analyze' | 'help' | 'float' | 'unknown';
    target?: string | number;
    raw: string;
}

export function parseAuraCommand(transcript: string): AuraCommand {
    const lower = transcript.toLowerCase().trim();

    // Stabilize commands
    const stabilizeMatch = lower.match(/stabilize\s+(?:floor\s+)?(\d+)/);
    if (stabilizeMatch) {
        return { action: 'stabilize', target: parseInt(stabilizeMatch[1]), raw: transcript };
    }

    if (lower.includes('emergency') || lower.includes('all floors')) {
        return { action: 'emergency', raw: transcript };
    }

    // Status commands
    if (lower.includes('status') || lower.includes('report') || lower.includes('health')) {
        const floorMatch = lower.match(/floor\s+(\d+)/);
        if (floorMatch) {
            return { action: 'status', target: parseInt(floorMatch[1]), raw: transcript };
        }
        return { action: 'status', raw: transcript };
    }

    // Analyze commands
    if (lower.includes('analyze') || lower.includes('diagnose') || lower.includes('scan')) {
        return { action: 'analyze', raw: transcript };
    }

    // Float commands
    if (lower.includes('float') || lower.includes('find me')) {
        return { action: 'float', raw: transcript };
    }

    // Help
    if (lower.includes('help') || lower.includes('commands')) {
        return { action: 'help', raw: transcript };
    }

    return { action: 'unknown', raw: transcript };
}
