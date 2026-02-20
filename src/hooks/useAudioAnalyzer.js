import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudioAnalyzer() {
    const [isActive, setIsActive] = useState(false);
    const [frequencyData, setFrequencyData] = useState(new Uint8Array(64));
    const [timeDomainData, setTimeDomainData] = useState(new Uint8Array(64));
    const [averageFrequency, setAverageFrequency] = useState(0);
    const [peakFrequency, setPeakFrequency] = useState(0);
    const [distortionLevel, setDistortionLevel] = useState(0);

    const audioContextRef = useRef(null);
    const analyzerRef = useRef(null);
    const oscillatorRef = useRef(null);
    const noiseGainRef = useRef(null);
    const filterRef = useRef(null);
    const animationRef = useRef(null);
    const analyzeRef = useRef(null);
    const isActiveRef = useRef(false);



    const setDistance = useCallback((distance) => {
        if (!audioContextRef.current || !noiseGainRef.current || !filterRef.current) return;

        const noiseLevel = Math.min(0.8, distance / 500);
        const filterFreq = Math.max(200, 5000 - (distance * 10));

        noiseGainRef.current.gain.setTargetAtTime(noiseLevel, audioContextRef.current.currentTime, 0.1);
        filterRef.current.frequency.setTargetAtTime(filterFreq, audioContextRef.current.currentTime, 0.1);
    }, []);

    const isSupported = typeof window !== 'undefined' && 'AudioContext' in window;

    const analyze = useCallback(() => {
        if (!analyzerRef.current || !isActiveRef.current) return;


        const analyzer = analyzerRef.current;
        const freqData = new Uint8Array(analyzer.frequencyBinCount);
        const timeData = new Uint8Array(analyzer.frequencyBinCount);

        analyzer.getByteFrequencyData(freqData);
        analyzer.getByteTimeDomainData(timeData);

        const avg = freqData.reduce((a, b) => a + b, 0) / freqData.length;
        const peak = Math.max(...freqData);

        let distortion = 0;
        for (let i = 1; i < timeData.length; i++) {
            distortion += Math.abs(timeData[i] - timeData[i - 1]);
        }
        distortion = (distortion / timeData.length) / 255 * 100;

        setFrequencyData(freqData);
        setTimeDomainData(timeData);
        setAverageFrequency(avg);
        setPeakFrequency(peak);
        setDistortionLevel(distortion);

        animationRef.current = requestAnimationFrame(() => analyzeRef.current());
    }, []);


    useEffect(() => {
        analyzeRef.current = analyze;
    }, [analyze]);


    const startAnalyzer = useCallback(async () => {
        if (!isSupported || isActive) return;

        try {
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;

            const analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 128;
            analyzer.smoothingTimeConstant = 0.8;
            analyzerRef.current = analyzer;

            const oscillator = audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.value = 440; // Standard A4 tuning frequency

            const oscillator2 = audioContext.createOscillator();
            oscillator2.type = 'triangle';
            oscillator2.frequency.value = 220;

            const mainGain = audioContext.createGain();
            mainGain.gain.value = 0.2;

            const gain2 = audioContext.createGain();
            gain2.gain.value = 0.1;

            const filter = audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 5000;
            filterRef.current = filter;

            const bufferSize = 2 * audioContext.sampleRate;
            const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            const noise = audioContext.createBufferSource();
            noise.buffer = noiseBuffer;
            noise.loop = true;

            const noiseGain = audioContext.createGain();
            noiseGain.gain.value = 0;
            noiseGainRef.current = noiseGain;

            noise.connect(noiseGain);
            noiseGain.connect(filter);

            mainGain.connect(filter);
            gain2.connect(filter);

            filter.connect(analyzer);

            const masterGain = audioContext.createGain();
            masterGain.gain.value = 0.05;
            analyzer.connect(masterGain);
            masterGain.connect(audioContext.destination);

            noise.start();
            oscillator.start();
            oscillator2.start();
            oscillatorRef.current = oscillator;

            setIsActive(true);
            isActiveRef.current = true;
            analyze();

        } catch (error) {
            console.error('Failed to start audio analyzer:', error);
        }
    }, [isSupported, isActive, analyze]);

    const stopAnalyzer = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
        }
        setIsActive(false);
        isActiveRef.current = false;

        setFrequencyData(new Uint8Array(64));
        setTimeDomainData(new Uint8Array(64));
        setAverageFrequency(0);
        setPeakFrequency(0);
        setDistortionLevel(0);
    }, []);

    useEffect(() => {
        return () => {
            stopAnalyzer();
        };
    }, [stopAnalyzer]);

    return {
        frequencyData,
        timeDomainData,
        averageFrequency,
        peakFrequency,
        distortionLevel,
        isActive,
        startAnalyzer,
        stopAnalyzer,
        setDistance,
        isSupported,
    };
}
