import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { Radio as RadioIcon, MapPin, Zap, Wind, Play, Pause, Volume2 } from 'lucide-react';
import { fetchGlobalStations } from '../../api/radioApi';
import { useAudioFilter } from '../../hooks/useAudioFilter';
import { SpectrumVisualizer } from './SpectrumVisualizer';
import logo from '../../assets/logo.jpg';
import { fetchGlobalNews, type NewsEvent } from '../../api/newsApi';

interface RadioStationData {
    stationid: string;
    name: string;
    country: string;
    location: string;
    bitrate: string;
    tags: string;
    url_resolved?: string;
}

export function RadioDashboard() {
    const [stations, setStations] = useState<RadioStationData[]>([]);
    const [gravity, setGravity] = useState(9.8);
    const [selectedStation, setSelectedStation] = useState<RadioStationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState('');
    const [offset, setOffset] = useState(0);
    const [particles, setParticles] = useState<{ id: number, x: number, y: number, size: number, speed: number }[]>([]);
    const [news, setNews] = useState<NewsEvent[]>([]);
    const [isNewsLoading, setIsNewsLoading] = useState(true);

    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.7);

    const audioRef = useRef<HTMLAudioElement>(null);
    const { initAudio, updateFilter } = useAudioFilter();

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Initial particles
    useEffect(() => {
        const initialParticles = Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 2 + 0.5
        }));
        setParticles(initialParticles);
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const loadStations = async (query = '', tag = '', append = false) => {
        if (append) setLoadingMore(true);
        else setLoading(true);

        try {
            const newOffset = append ? offset + 12 : 0;
            const data = await fetchGlobalStations(query, tag, 12, newOffset);

            if (Array.isArray(data) && data.length > 0) {
                setStations(prev => append ? [...prev, ...data] : data);
                setOffset(newOffset);
            } else if (!append) {
                // Trigger fallback if no data matches search/tag or API is empty
                throw new Error("No stations found");
            }
        } catch (e) {
            console.error("Failed to load stations", e);
            if (!append) {
                setStations([
                    { stationid: '1', name: 'Neo-Dhaka FM', country: 'BD', location: 'Dhaka', bitrate: '320', tags: 'Industrial,Synth' },
                    { stationid: '2', name: 'Night City Radio', country: 'JP', location: 'Tokyo', bitrate: '256', tags: 'Cyberpunk,Wave' },
                    { stationid: '3', name: 'Lower East Static', country: 'US', location: 'New York', bitrate: '128', tags: 'Glitch,Hop' },
                    { stationid: '4', name: 'Helsinki Frost', country: 'FI', location: 'Helsinki', bitrate: '320', tags: 'Metal,Cold' },
                ]);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        loadStations(searchQuery, activeTag);
    }, [activeTag]);

    useEffect(() => {
        const loadNews = async () => {
            setIsNewsLoading(true);
            try {
                const data = await fetchGlobalNews();
                setNews(data);
            } catch (e) {
                console.error("Failed to load news", e);
            } finally {
                setIsNewsLoading(false);
            }
        };
        loadNews();
        // Refresh news every 3 minutes
        const interval = setInterval(loadNews, 180000);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadStations(searchQuery, activeTag);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        mouseX.set(clientX);
        mouseY.set(clientY);

        if (selectedStation) {
            const dist = Math.sqrt(Math.pow(clientX - window.innerWidth / 2, 2) + Math.pow(clientY - window.innerHeight / 2, 2));
            updateFilter(dist);
        }
    };

    const handleStationClick = (station: RadioStationData) => {
        setSelectedStation(station);
        if (audioRef.current) {
            initAudio(audioRef.current);
            if (station.url_resolved) {
                audioRef.current.src = station.url_resolved;
                audioRef.current.volume = volume;
                audioRef.current.play()
                    .then(() => setIsPlaying(true))
                    .catch(() => {
                        console.warn("Autoplay blocked by sector policy");
                        setIsPlaying(false);
                    });
            }
        }
    };

    const togglePlay = () => {
        if (!audioRef.current || !selectedStation) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
        }
    };

    const genres = ['', 'synthwave', 'metal', 'lofi', 'techno', 'ambient'];

    return (
        <div
            className="min-h-screen bg-[#050508] text-white p-8 font-sans relative overflow-hidden crt-screen data-grid-bg"
            onMouseMove={handleMouseMove}
        >
            {/* Background Particles Layer */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                {particles.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ y: p.y }}
                        animate={{ y: [p.y, -20] }}
                        transition={{ duration: p.speed * 10, repeat: Infinity, ease: "linear" }}
                        className="absolute bg-white rounded-full"
                        style={{ left: p.x, width: p.size, height: p.size, filter: 'blur(1px)' }}
                    />
                ))}
            </div>

            <div className="scanner-line" />
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-[#00f5ff]/20 pb-8 relative z-10 gap-8 glass-panel-deep p-6 rounded-xl neon-glow-cyan">
                <div className="flex items-center gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative group"
                    >
                        <div className="absolute -inset-2 bg-[#00f5ff]/20 blur-xl group-hover:bg-[#00f5ff]/40 transition-all rounded-full" />
                        <img
                            src={logo}
                            alt="ThunderStrike Logo"
                            className="h-16 w-auto relative z-10 drop-shadow-[0_0_15px_rgba(0,245,255,0.5)] group-hover:scale-105 transition-transform duration-500"
                        />
                    </motion.div>

                    <div className="h-12 w-[1px] bg-white/10 hidden md:block" />

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-[#00f5ff] animate-pulse" />
                            <p className="text-[10px] font-mono text-[#00f5ff]/60 uppercase tracking-[4px]">Aether_Link_Established</p>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-[2px] text-white uppercase italic font-display">
                            Aether <span className="text-[#00f5ff]">Dashboard</span>
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="relative w-full md:w-80 group">
                        <input
                            type="text"
                            placeholder="RECALIBRATE FREQUENCY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-[#00f5ff]/20 rounded-lg px-6 py-3 text-sm font-mono focus:outline-none focus:border-[#00f5ff] focus:ring-1 focus:ring-[#00f5ff]/50 transition-all placeholder:text-[#00f5ff]/20 text-[#00f5ff]"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Zap size={14} className="text-[#00f5ff] animate-pulse" />
                        </div>
                    </form>

                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide bg-black/20 p-2 rounded-lg border border-white/5">
                        {genres.map(genre => (
                            <button
                                key={genre}
                                onClick={() => setActiveTag(genre)}
                                className={`px-4 py-1.5 rounded-md border text-[11px] font-mono uppercase tracking-[2px] transition-all whitespace-nowrap ${activeTag === genre
                                    ? 'bg-[#00f5ff]/10 border-[#00f5ff] text-[#00f5ff] shadow-[0_0_10px_rgba(0,245,255,0.2)]'
                                    : 'bg-white/5 border-white/5 text-white/30 hover:border-white/20 hover:text-white/60'
                                    }`}
                            >
                                {genre || 'ALL_BANDS'}
                            </button>
                        ))}
                    </div>

                    <div className="text-right whitespace-nowrap hidden lg:block">
                        <span className="block text-[10px] font-mono text-[#00f5ff]/40 uppercase mb-1">Grav-Link Stability</span>
                        <div className="flex items-center gap-4">
                            <input
                                type="range" min="0" max="9.8" step="0.1"
                                value={gravity}
                                onChange={(e) => setGravity(parseFloat(e.target.value))}
                                className="w-32 h-1 bg-black rounded-full appearance-none cursor-pointer accent-[#00f5ff] border border-white/5"
                            />
                            <span className="font-mono text-[#00f5ff] text-sm w-8">{gravity.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                {/* Relocated News Ticker */}
                <div className="w-full mt-6 pt-6 border-t border-white/10 overflow-hidden relative">
                    <div className="absolute left-0 top-6 bottom-0 w-20 bg-gradient-to-r from-[#0d0d14] to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-6 bottom-0 w-20 bg-gradient-to-l from-[#0d0d14] to-transparent z-10 pointer-events-none" />

                    <div className="flex items-center gap-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 bg-[#00f5ff]/10 px-3 py-1 rounded border border-[#00f5ff]/20 shrink-0">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            <span className="text-[10px] font-mono text-[#00f5ff] font-bold uppercase tracking-wider">Aether Pulse // LIVE</span>
                        </div>

                        <motion.div
                            animate={{ x: [0, -1000] }}
                            transition={{
                                duration: 30,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="flex items-center gap-12"
                        >
                            {isNewsLoading ? (
                                <span className="text-[10px] font-mono text-white/20 uppercase">Establishing secure news link...</span>
                            ) : (
                                [...news, ...news].map((item, idx) => (
                                    <div key={`${item.id}-${idx}`} className="flex items-center gap-4 group cursor-help">
                                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase ${item.category === 'CRITICAL' ? 'bg-red-500 text-white' :
                                                item.category === 'WARNING' ? 'bg-amber-500 text-black' :
                                                    'bg-white/10 text-white/60'
                                            }`}>
                                            {item.category}
                                        </span>
                                        <span className="font-mono text-[11px] text-[#00f5ff]/80 font-bold uppercase">
                                            [{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
                                        </span>
                                        <span className="text-[11px] font-bold text-white uppercase tracking-wider group-hover:text-[#00f5ff] transition-colors">
                                            {item.headline}
                                        </span>
                                        <span className="text-white/20 font-mono">///</span>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pb-48 max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                    {loading && !loadingMore ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
                        ))
                    ) : (
                        stations.map((station, index) => (
                            <motion.div
                                key={station.stationid + index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{
                                    opacity: 1,
                                    y: selectedStation?.stationid === station.stationid ? -5 : 0
                                }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleStationClick(station)}
                                className={`group relative p-6 rounded-2xl glass-panel-deep border transition-all duration-500 cursor-pointer holographic-card ${selectedStation?.stationid === station.stationid ? 'border-[#00f5ff] bg-[#00f5ff]/5' : 'border-white/10'}`}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-black/40 rounded-xl group-hover:scale-110 transition-transform">
                                        <RadioIcon className={selectedStation?.stationid === station.stationid ? "text-[#00f5ff]" : "text-white/40"} size={24} />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className={`w-1 h-3 rounded-full ${i <= (parseInt(station.bitrate) > 128 ? 4 : 2) ? 'bg-[#00f5ff]' : 'bg-white/10'}`} />
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-mono text-white/20 mt-1 uppercase">SIG_STRENGTH</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00f5ff] transition-colors truncate">
                                    {station.name}
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-white/40">
                                        <MapPin size={14} className="text-[#00f5ff]/40" />
                                        <span className="text-xs font-medium uppercase tracking-wider truncate">
                                            {station.country || 'Unknown Sector'} // {station.location || 'Deep Space'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {station.tags?.split(',').slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-white/5 rounded-full border border-white/10 text-white/60 font-mono uppercase">
                                                #{tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {selectedStation?.stationid === station.stationid && (
                                    <div className="absolute top-4 right-4 flex gap-1">
                                        <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-[#00f5ff]" />
                                        <motion.div animate={{ height: [8, 4, 8] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-1 bg-[#00f5ff]" />
                                        <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-1 bg-[#00f5ff]" />
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>

                {stations.length > 0 && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => loadStations(searchQuery, activeTag, true)}
                            disabled={loadingMore}
                            className="px-8 py-3 bg-black border border-[#00f5ff]/30 text-[#00f5ff] rounded-xl flex items-center gap-3 hover:bg-[#00f5ff]/10 transition-all font-mono uppercase tracking-[3px] shadow-[0_0_20px_rgba(0,245,255,0.1)] hover:shadow-[0_0_30px_rgba(0,245,255,0.2)] disabled:opacity-50"
                        >
                            {loadingMore ? 'EXPANDING_RANGE...' : 'LOAD_MORE_FREQUENCIES'}
                        </button>
                    </div>
                )}
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-[#050508] via-[#050508]/95 to-transparent z-20 pointer-events-none backdrop-blur-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 md:items-end">

                    {/* Station Info & Playback Toggle */}
                    <div className="flex items-center gap-6 pointer-events-auto glass-panel-deep p-6 rounded-2xl border-[#00f5ff]/20 w-full md:w-auto">
                        <div className="relative group/play">
                            <div className={`w-20 h-20 rounded-xl bg-black border-2 flex items-center justify-center transition-all duration-500 ${selectedStation ? 'border-[#00f5ff] shadow-[0_0_20px_#00f5ff]' : 'border-white/10'}`}>
                                {selectedStation ? (
                                    <motion.div animate={isPlaying ? { scale: [1, 1.2, 1], rotate: [0, 90, 180, 270, 360] } : {}} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}>
                                        <Zap className={isPlaying ? "text-[#00f5ff]" : "text-[#00f5ff]/30"} size={32} />
                                    </motion.div>
                                ) : (
                                    <Wind className="text-white/10" size={32} />
                                )}
                            </div>

                            {selectedStation && (
                                <button
                                    onClick={togglePlay}
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/play:opacity-100 transition-opacity rounded-xl"
                                >
                                    {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" />}
                                </button>
                            )}

                            {isPlaying && <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#00f5ff] rounded-full animate-ping" />}
                        </div>

                        <div className="flex-1 min-w-[200px]">
                            <div className="flex items-center gap-3 mb-2">
                                <p className="text-[10px] font-mono text-[#00f5ff] uppercase tracking-[5px] font-bold">
                                    {selectedStation ? (isPlaying ? 'SYPHONING_AETHER' : 'LINK_STANDBY') : 'WAITING_FOR_DATA'}
                                </p>
                                {selectedStation && (
                                    <button
                                        onClick={togglePlay}
                                        className="p-1 hover:text-[#00f5ff] transition-colors"
                                    >
                                        {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                                    </button>
                                )}
                            </div>
                            <h2 className="text-2xl font-black truncate text-white leading-tight uppercase tracking-[-1px] mb-1">
                                {selectedStation?.name || '--- NO_SIGNAL ---'}
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#00ffbc] animate-pulse' : 'bg-white/10'}`} />
                                <span className="text-[10px] font-mono text-white/30 uppercase tracking-[2px]">
                                    {selectedStation ? `BITRATE: ${selectedStation.bitrate}KBPS // VOLUME: ${Math.round(volume * 100)}%` : 'IDLE_MODE'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Spectral Visualizer */}
                    <div className="flex-1 max-w-xl w-full pointer-events-auto glass-panel-deep p-6 rounded-2xl border-[#00f5ff]/20">
                        <div className="flex justify-between mb-4">
                            <span className="text-[10px] font-mono text-[#00f5ff]/60 uppercase tracking-[3px]">Aether_Spectral_Analyzer</span>
                            <div className="flex items-center gap-2">
                                <Volume2 size={12} className="text-[#00f5ff]/40" />
                                <input
                                    type="range" min="0" max="1" step="0.01"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="w-24 h-1 bg-black rounded-full appearance-none cursor-pointer accent-[#00f5ff] border border-white/5"
                                />
                            </div>
                        </div>
                        <SpectrumVisualizer
                            isActive={isPlaying}
                            frequency={gravity * 50}
                            signalStrength={selectedStation ? 80 : 10}
                        />
                    </div>

                    <div className="text-right pointer-events-auto glass-panel-deep p-6 rounded-2xl border-[#00f5ff]/20 hidden lg:block">
                        <div className="text-right mb-6">
                            <span className="block text-[10px] font-mono text-[#00f5ff]/40 uppercase mb-2 tracking-[3px]">Universal Grav-Link</span>
                            <div className="flex items-center gap-6">
                                <span className="font-mono text-[#00f5ff] text-xl font-bold border-b-2 border-[#00f5ff]">{gravity.toFixed(1)}</span>
                                <input
                                    type="range" min="0" max="9.8" step="0.1"
                                    value={gravity}
                                    onChange={(e) => setGravity(parseFloat(e.target.value))}
                                    className="w-40 h-1.5 bg-black rounded-full appearance-none cursor-pointer accent-[#00f5ff] border border-white/5"
                                />
                            </div>
                        </div>
                        <div className="font-mono text-[#00f5ff] text-xl tracking-[4px] flex items-center justify-end gap-3 font-black">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                            <div className="w-2 h-2 bg-[#00f5ff] rounded-full animate-ping" />
                        </div>
                    </div>
                </div>
            </footer>

            <audio ref={audioRef} crossOrigin="anonymous" />
        </div>
    );
}
