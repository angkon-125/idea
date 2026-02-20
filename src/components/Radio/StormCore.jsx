import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadioTower, Globe } from 'lucide-react';
import './StormCore.css';

const MOCK_STATIONS = [
    { id: '1', name: 'Alpha Sector', location: 'Dhaka', weight: 1.2, x: -100, y: -50, z: 0 },
    { id: '2', name: 'Beta Sector', location: 'Tokyo', weight: 0.8, x: 100, y: 50, z: 0 },
    { id: '3', name: 'Gamma Sector', location: 'New York', weight: 1.0, x: 0, y: 150, z: 0 },
];

export function StormCore() {
    const containerRef = useRef(null);
    const activeStationId = '1';

    const handleStationClick = (id) => {
        console.log("Station clicked:", id);
    };

    return (
        <div className="storm-core-container glass-panel" ref={containerRef}>
            <div className="storm-header">
                <div className="storm-title">
                    <Globe className="icon pulse-glow" />
                    <h2>Storm Global Frequencies</h2>
                </div>
            </div>

            <div className="storm-viewport">
                <div
                    className="world-plate"
                    style={{
                        transform: `perspective(1000px) rotateX(60deg) translateY(0px)`,
                        opacity: 1
                    }}
                />

                <AnimatePresence>
                    {MOCK_STATIONS.map((station) => {
                        const isActive = activeStationId === station.id;
                        const floatHeight = 20;

                        return (
                            <motion.div
                                key={station.id}
                                layoutId={station.id}
                                className={`station-anchor ${isActive ? 'active' : ''}`}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    x: station.x,
                                    y: station.y - floatHeight,
                                    z: station.z,
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 50,
                                    damping: 10,
                                }}
                                onClick={() => handleStationClick(station.id)}
                            >
                                <div className="station-node">
                                    <div className="node-icon">
                                        <RadioTower size={16} />
                                    </div>
                                    <div className="node-info">
                                        <span className="node-name">{station.name}</span>
                                        <span className="node-loc">{station.location}</span>
                                    </div>
                                    {isActive && <div className="node-pulse" />}
                                </div>

                                <div
                                    className="anchor-line"
                                    style={{
                                        height: floatHeight + 20,
                                        opacity: 0.3
                                    }}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                <div className="user-pointer">
                    <div className="pointer-core" />
                    <div className="pointer-rings">
                        <div className="ring" />
                        <div className="ring" />
                    </div>
                </div>
            </div>
        </div>
    );
}
