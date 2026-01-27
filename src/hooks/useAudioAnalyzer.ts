import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioAnalyzerData {
    frequencyData: Uint8Array;
    timeDomainData: Uint8Array;
    averageFrequency: number;
    peakFrequency: number;
    distortionLevel: number;
    isActive: boolean;
}

interface UseAudioAnalyzerReturn extends AudioAnalyzerData {
    startAnalyzer: () => Promise<void>;
    stopAnalyzer: () => void;
    setDistance: (distance: number) => void;
    isSupported: boolean;
}

export function useAudioAnalyzer(): UseAudioAnalyzerReturn {
    const [isActive, setIsActive] = useState(false);
    const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(64));
    const [timeDomainData, setTimeDomainData] = useState<Uint8Array>(new Uint8Array(64));
    const [averageFrequency, setAverageFrequency] = useState(0);
    const [peakFrequency, setPeakFrequency] = useState(0);
    const [distortionLevel, setDistortionLevel] = useState(0);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const noiseGainRef = useRef<GainNode | null>(null);
    const filterRef = useRef<BiquadFilterNode | null>(null);
    const animationRef = useRef<number | null>(null);

    const setDistance = useCallback((distance: number) => {
        if (!audioContextRef.current || !noiseGainRef.current || !filterRef.current) return;

        // As distance increases, noise increases and high frequencies are filtered out
        const noiseLevel = Math.min(0.8, distance / 500);
        const filterFreq = Math.max(200, 5000 - (distance * 10));

        noiseGainRef.current.gain.setTargetAtTime(noiseLevel, audioContextRef.current.currentTime, 0.1);
        filterRef.current.frequency.setTargetAtTime(filterFreq, audioContextRef.current.currentTime, 0.1);
    }, []);

    const isSupported = typeof window !== 'undefined' && 'AudioContext' in window;

    const analyze = useCallback(() => {
        if (!analyzerRef.current || !isActive) return;

        const analyzer = analyzerRef.current;
        const freqData = new Uint8Array(analyzer.frequencyBinCount);
        const timeData = new Uint8Array(analyzer.frequencyBinCount);

        analyzer.getByteFrequencyData(freqData);
        analyzer.getByteTimeDomainData(timeData);

        // Calculate metrics
        const avg = freqData.reduce((a, b) => a + b, 0) / freqData.length;
        const peak = Math.max(...freqData);

        // Calculate distortion from time domain data
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

        animationRef.current = requestAnimationFrame(() => analyze());
    }, [isActive]);

    const startAnalyzer = useCallback(async () => {
        if (!isSupported || isActive) return;

        try {
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;

            // Create analyzer
            const analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 128;
            analyzer.smoothingTimeConstant = 0.8;
            analyzerRef.current = analyzer;

            // Create simulated anti-gravity field hum
            const oscillator = audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.value = 432; // Base frequency of the anti-grav field

            // Add some harmonics for richness
            const oscillator2 = audioContext.createOscillator();
            oscillator2.type = 'triangle';
            oscillator2.frequency.value = 216; // Sub-harmonic

            const oscillator3 = audioContext.createOscillator();
            oscillator3.type = 'sawtooth';
            oscillator3.frequency.value = 864; // Overtone

            // Create gain nodes
            const mainGain = audioContext.createGain();
            mainGain.gain.value = 0.3;

            const gain2 = audioContext.createGain();
            gain2.gain.value = 0.15;

            const gain3 = audioContext.createGain();
            gain3.gain.value = 0.05;

            // Create spatial filter
            const filter = audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 5000;
            filterRef.current = filter;

            // Create white noise for distance simulation
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
            noiseGain.gain.value = 0; // Starts silent
            noiseGainRef.current = noiseGain;

            noise.connect(noiseGain);
            noiseGain.connect(filter);

            // Connect oscillators to filter
            mainGain.connect(filter);
            gain2.connect(filter);
            gain3.connect(filter);

            // Connect filter to analyzer
            filter.connect(analyzer);

            // Also output to speakers (quietly)
            const masterGain = audioContext.createGain();
            masterGain.gain.value = 0.1;
            analyzer.connect(masterGain);
            masterGain.connect(audioContext.destination);

            // Start oscillators
            noise.start();
            oscillator.start();
            oscillator2.start();
            oscillator3.start();
            oscillatorRef.current = oscillator;

            // Add random modulation to simulate field fluctuations
            const modulate = () => {
                if (oscillatorRef.current && audioContextRef.current) {
                    const baseFreq = 432;
                    const fluctuation = (Math.random() - 0.5) * 20;
                    oscillator.frequency.setValueAtTime(
                        baseFreq + fluctuation,
                        audioContextRef.current.currentTime
                    );
                }
                if (isActive) {
                    setTimeout(modulate, 100);
                }
            };

            setIsActive(true);
            modulate();
            analyze();
        } catch (error) {
            console.error('Failed to start audio analyzer:', error);
        }
    }, [isSupported, isActive, analyze]);

    const stopAnalyzer = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        if (oscillatorRef.current) {
            oscillatorRef.current.stop();
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        setIsActive(false);
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
