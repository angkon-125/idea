import { useRef, useCallback, useEffect } from 'react';

export const useAudioFilter = () => {
    const audioContextRef = useRef(null);
    const filterRef = useRef(null);
    const sourceRef = useRef(null);

    const initAudio = useCallback((audioElement) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (!sourceRef.current) {
            const ctx = audioContextRef.current;
            filterRef.current = ctx.createBiquadFilter();
            filterRef.current.type = 'highpass';
            filterRef.current.frequency.value = 0;

            // Ensure crossOrigin is set on the element for CORS
            audioElement.crossOrigin = "anonymous";

            sourceRef.current = ctx.createMediaElementSource(audioElement);
            sourceRef.current.connect(filterRef.current);
            filterRef.current.connect(ctx.destination);
        }

        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    }, []);

    const updateFilter = useCallback((distance) => {
        if (filterRef.current && audioContextRef.current) {
            // Atmospheric interference simulation
            // higher distance = higher cut-off frequency
            const frequency = Math.min(2000, distance * 5);
            filterRef.current.frequency.setTargetAtTime(
                frequency,
                audioContextRef.current.currentTime,
                0.1
            );
        }
    }, []);

    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(console.error);
            }
        };
    }, []);

    return { initAudio, updateFilter };
};
