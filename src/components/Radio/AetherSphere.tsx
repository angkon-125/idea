import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGravity } from '../../context/GravityContext';
import { RadioTower, Globe, Zap } from 'lucide-react';
import './AetherSphere.css';

export function AetherSphere() {
    const { state, dispatch } = useGravity();
    const { stations, gConstant, activeStationId } = state;

    const containerRef = useRef<HTMLDivElement>(null);

    const handleStationClick = (id: string) => {
        dispatch({ type: 'SET_ACTIVE_STATION', payload: id });
    };

    const getStability = (g: number) => {
        if (g > 8) return 'Stable Surface';
        if (g > 4) return 'Sub-Orbital Drift';
        return 'Zero-G Aether';
    };

    return (
        <div className="aether-sphere-container glass-panel" ref={containerRef}>
            <div className="aether-header">
                <div className="aether-title">
                    <Globe className="icon pulse-glow" />
                    <h2>Global Freq Aether</h2>
                </div>
                <div className="gravity-badge">
                    <Zap className="icon-xs" />
                    <span>{getStability(gConstant)}</span>
                </div>
            </div>

            <div className="aether-viewport">
                {/* The 3D World Plate */}
                <div
                    className="world-plate"
                    style={{
                        transform: `perspective(1000px) rotateX(60deg) translateY(${-(9.8 - gConstant) * 20}px)`,
                        opacity: gConstant / 9.8
                    }}
                />

                <AnimatePresence>
                    {stations.map((station) => {
                        const isActive = activeStationId === station.id;
                        // Calculate float height based on G-constant and station weight
                        const floatHeight = (9.8 - gConstant) * 30 * (1 / station.weight);
                        const driftX = (Math.sin(Date.now() / 2000 + parseInt(station.id)) * (9.8 - gConstant) * 5);

                        return (
                            <motion.div
                                key={station.id}
                                layoutId={station.id}
                                className={`station-anchor ${isActive ? 'active' : ''}`}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    x: station.x + driftX,
                                    y: station.y - floatHeight,
                                    z: station.z,
                                    rotateY: isActive ? 360 : 0
                                }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 50,
                                    damping: 10,
                                    rotateY: { duration: 2, repeat: isActive ? Infinity : 0, ease: "linear" }
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

                                {/* Connecting Line to Ground */}
                                <div
                                    className="anchor-line"
                                    style={{
                                        height: floatHeight + 20,
                                        opacity: 0.3 * (gConstant / 9.8)
                                    }}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* User Central Point */}
                <div className="user-pointer">
                    <div className="pointer-core" />
                    <div className="pointer-rings">
                        <div className="ring" />
                        <div className="ring" />
                    </div>
                </div>
            </div>

            <div className="aether-controls">
                <div className="g-slider-control">
                    <label>ANTI-GRAV LEVEL</label>
                    <input
                        type="range"
                        min="0"
                        max="9.8"
                        step="0.1"
                        value={gConstant}
                        onChange={(e) => dispatch({ type: 'SET_G_CONSTANT', payload: parseFloat(e.target.value) })}
                    />
                    <div className="g-value">{gConstant.toFixed(1)} m/s²</div>
                </div>
            </div>
        </div>
    );
}
