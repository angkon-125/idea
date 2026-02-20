import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function SpectrumVisualizer({ isActive, frequency, signalStrength }) {
    const [bars, setBars] = useState(new Array(24).fill(5));

    useEffect(() => {
        if (!isActive) {
            setBars(new Array(24).fill(5));
            return;
        }

        const interval = setInterval(() => {
            setBars(prev => prev.map(() => {
                // Base height from signal strength
                const base = signalStrength / 4;
                // Add some jitter
                const jitter = Math.random() * 30;
                // Frequency affects the "wavelength" of the jitter (simulated)
                const freqMod = Math.sin(Date.now() / 100 * (frequency / 100)) * 10;

                return Math.max(5, Math.min(80, base + jitter + freqMod));
            }));
        }, 80);

        return () => clearInterval(interval);
    }, [isActive, frequency, signalStrength]);

    return (
        <div className="flex items-end justify-center gap-[2px] h-16 w-full px-4 overflow-hidden">
            {bars.map((height, i) => (
                <motion.div
                    key={i}
                    animate={{ height: `${height}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="spectrum-bar w-1 rounded-t-sm"
                    style={{
                        opacity: 0.3 + (height / 100),
                        filter: `hue-rotate(${i * 5}deg)`
                    }}
                />
            ))}
        </div>
    );
}
