import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { Radio as RadioIcon, MapPin, Zap, Wind, Play, Pause, Volume2 } from 'lucide-react';
import { fetchGlobalStations } from '../../api/radioApi';
import { useAudioFilter } from '../../hooks/useAudioFilter';
import { SpectrumVisualizer } from './SpectrumVisualizer';
import logo from '../../assets/logo.jpg';
import { fetchGlobalNews } from '../../api/newsApi';

export function RadioDashboard() {
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState('');
    const [offset, setOffset] = useState(0);
    const [particles, setParticles] = useState([]);
    const [news, setNews] = useState([]);
    const [isNewsLoading, setIsNewsLoading] = useState(true);

    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.7);

    const audioRef = useRef(null);
    const { initAudio, updateFilter } = useAudioFilter();

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Initial particles
    useEffect(() => {
        const initialParticles = Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100, // Use percentage
            y: Math.random() * 100, // Use percentage
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

    const loadStations = useCallback(async (query = '', tag = '', append = false) => {
        if (append) setLoadingMore(true);
        else setLoading(true);

        try {
            const newOffset = append ? offset + 12 : 0;
            const data = await fetchGlobalStations(query, tag, 12, newOffset);

            if (Array.isArray(data) && data.length > 0) {
                setStations(prev => append ? [...prev, ...data] : data);
                setOffset(newOffset);
            } else if (!append) {
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
    }, [offset]);

    useEffect(() => {
        loadStations(searchQuery, activeTag);
    }, [activeTag, searchQuery, loadStations]);

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
        const interval = setInterval(loadNews, 180000);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        loadStations(searchQuery, activeTag);
    };

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        mouseX.set(clientX);
        mouseY.set(clientY);

        if (selectedStation) {
            const dist = Math.sqrt(Math.pow(clientX - window.innerWidth / 2, 2) + Math.pow(clientY - window.innerHeight / 2, 2));
            updateFilter(dist);
        }
    };

    const handleStationClick = (station) => {
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
            className="min-h-screen bg-[#050508] text-white p-3 sm:p-[var(--spacing-fluid-md)] font-sans relative overflow-hidden crt-screen data-grid-bg"
            onMouseMove={handleMouseMove}
        >
            <div className="absolute inset-0 pointer-events-none opacity-30">
                {particles.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ y: `${p.y}%` }}
                        animate={{ y: [`${p.y}%`, `-20%`] }}
                        transition={{ duration: p.speed * 10, repeat: Infinity, ease: "linear" }}
                        className="absolute bg-white rounded-full"
                        style={{ left: `${p.x}%`, width: p.size, height: p.size, filter: 'blur(1px)' }}
                    />
                ))}
            </div>

            <div className="scanner-line" />
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-[var(--spacing-fluid-md)] border-b border-[#00f5ff]/20 pb-4 sm:pb-8 relative z-10 gap-3 sm:gap-[var(--spacing-fluid-sm)] glass-panel-deep p-3 sm:p-[var(--spacing-fluid-md)] rounded-xl neon-glow-cyan">
                <div className="flex items-center gap-[var(--spacing-fluid-sm)] w-full xl:w-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative group shrink-0"
                    >
                        <div className="absolute -inset-4 bg-[#00f5ff]/30 blur-2xl group-hover:bg-[#00f5ff]/50 transition-all rounded-full animate-pulse" />
                        <img
                            src={logo}
                            alt="Thunderstorm Logo"
                            className="h-[clamp(3.5rem,10vw,6rem)] w-auto relative z-10 drop-shadow-[0_0_25px_rgba(0,245,255,0.8)] group-hover:scale-105 transition-transform duration-500 rounded-lg"
                        />
                    </motion.div>

                    <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent hidden sm:block mx-4" />

                    <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#00f5ff] shadow-[0_0_10px_#00f5ff] animate-pulse shrink-0" />
                            <p className="text-[11px] font-mono text-[#00f5ff] font-bold uppercase tracking-[4px] truncate opacity-80">Link_Stable // Sector_DH</p>
                        </div>
                        <h1 className="leading-none truncate font-display font-black italic text-[clamp(2rem,6vw,3.5rem)] tracking-tighter">
                            THUNDER<span className="text-[#00f5ff] drop-shadow-[0_0_15px_rgba(0,245,255,0.5)]">STORM</span>
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-64 md:w-80 lg:w-96 group">
                        <input
                            type="text"
                            placeholder="RECALIBRATE FREQUENCY..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/60 border border-[#00f5ff]/30 rounded-xl px-4 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#00f5ff] focus:ring-2 focus:ring-[#00f5ff]/20 transition-all placeholder:text-[#00f5ff]/30 text-[#00f5ff] backdrop-blur-xl"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 group-focus-within:opacity-100 opacity-40 transition-opacity">
                            <Zap size={16} className="text-[#00f5ff] animate-pulse" />
                        </div>
                    </form>

                    <div className="flex gap-2.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide bg-white/5 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
                        {genres.map(genre => (
                            <button
                                key={genre}
                                onClick={() => setActiveTag(genre)}
                                className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-lg border text-[10px] sm:text-[12px] font-mono uppercase tracking-wider sm:tracking-[30%] transition-all duration-300 whitespace-nowrap ${activeTag === genre
                                    ? 'bg-[#00f5ff] border-[#00f5ff] text-black font-black shadow-[0_0_20px_rgba(0,245,255,0.4)]'
                                    : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white/80'
                                    }`}
                            >
                                {genre || 'ALL_BANDS'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10 overflow-hidden relative group/ticker box-content">
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0d0d14] to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0d0d14] to-transparent z-10 pointer-events-none" />

                    <div className="flex items-center gap-8 whitespace-nowrap">
                        <div className="flex items-center gap-2 sm:gap-4 bg-[#00f5ff]/10 px-3 py-2 sm:px-6 sm:py-2.5 rounded-xl border border-[#00f5ff]/30 shrink-0 backdrop-blur-xl z-20 shadow-[0_0_25px_rgba(0,245,255,0.15)] group-hover/ticker:border-[#00f5ff]/60 transition-colors">
                            <div className="relative">
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping opacity-75" />
                                <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-600" />
                            </div>
                            <span className="text-[10px] sm:text-[13px] font-mono text-[#00f5ff] font-black uppercase tracking-[2px] sm:tracking-[4px] font-display">Thunderstorm Pulse // LIVE</span>
                        </div>

                        <div className="ticker-wrapper relative flex-1 overflow-hidden">
                            <motion.div
                                animate={{ x: ["0%", "-50%"] }}
                                transition={{
                                    duration: 40,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="flex items-center gap-24 w-max"
                            >
                                {isNewsLoading ? (
                                    <div className="flex gap-8 items-center px-8">
                                        <span className="text-[12px] font-mono text-[#00f5ff]/40 uppercase tracking-widest animate-pulse">Establishing sub-space frequency...</span>
                                    </div>
                                ) : (
                                    [...news, ...news].map((item, idx) => (
                                        <div key={`${item.id}-${idx}`} className="flex items-center gap-8 group/item cursor-help py-1">
                                            <span className={`text-[11px] font-mono px-3 py-1 rounded-md uppercase font-black tracking-tighter ${item.category === 'CRITICAL' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.6)]' :
                                                item.category === 'WARNING' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)]' :
                                                    'bg-[#00f5ff]/20 text-[#00f5ff] border border-[#00f5ff]/40'
                                                }`}>
                                                {item.category}
                                            </span>
                                            <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                                                <span className="font-mono text-[12px] text-[#00f5ff]/60 font-medium">
                                                    [{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
                                                </span>
                                                <span className="text-[clamp(14px,1.8vw,18px)] font-bold text-white uppercase tracking-wider group-hover/item:text-[#00f5ff] transition-all group-hover/item:translate-x-2 duration-500">
                                                    {item.headline}
                                                </span>
                                            </div>
                                            <span className="text-white/10 font-mono text-2xl font-light last:hidden ml-8">/</span>
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pb-36 sm:pb-40 md:pb-48 w-full max-w-[2400px] mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 sm:gap-6 mb-10 sm:mb-16">
                    {loading && !loadingMore ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/10" />
                        ))
                    ) : (
                        stations.map((station, index) => (
                            <motion.div
                                key={station.stationid + index}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{
                                    opacity: 1,
                                    y: selectedStation?.stationid === station.stationid ? -8 : 0,
                                    scale: selectedStation?.stationid === station.stationid ? 1.02 : 1
                                }}
                                transition={{ delay: index * 0.03, type: 'spring', stiffness: 100 }}
                                onClick={() => handleStationClick(station)}
                                className={`group relative p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl glass-panel-deep border-2 transition-all duration-500 cursor-pointer holographic-card ${selectedStation?.stationid === station.stationid ? 'border-[#00f5ff] bg-[#00f5ff]/10 shadow-[0_0_40px_rgba(0,245,255,0.2)]' : 'border-white/5 hover:border-white/20'}`}
                            >
                                <div className="flex justify-between items-start mb-4 sm:mb-8">
                                    <div className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-500 ${selectedStation?.stationid === station.stationid ? 'bg-[#00f5ff] text-black shadow-[0_0_20px_#00f5ff]' : 'bg-black/60 text-[#00f5ff]/40 group-hover:text-[#00f5ff]'}`}>
                                        <RadioIcon size={22} className={`sm:!w-7 sm:!h-7 ${selectedStation?.stationid === station.stationid ? "" : "group-hover:animate-pulse"}`} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex gap-1.5">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className={`w-1.5 h-4 rounded-full transition-all duration-700 ${i <= (parseInt(station.bitrate) > 200 ? 5 : parseInt(station.bitrate) > 128 ? 3 : 2) ? 'bg-[#00f5ff] shadow-[0_0_10px_#00f5ff]' : 'bg-white/10'}`} />
                                            ))}
                                        </div>
                                        <span className="text-[11px] font-mono text-white/30 uppercase tracking-[3px] font-bold">SIGNAL_STRENGTH</span>
                                    </div>
                                </div>

                                <h3 className="text-lg sm:text-2xl font-black text-white mb-2 sm:mb-3 group-hover:text-[#00f5ff] transition-colors truncate tracking-tight">
                                    {station.name}
                                </h3>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-white/50">
                                        <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
                                            <MapPin size={16} className="text-[#00f5ff]" />
                                        </div>
                                        <span className="text-sm font-bold uppercase tracking-widest truncate">
                                            {station.country || 'Unknown'} {'//'} {station.location || 'Deep Space'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2.5">
                                        {station.tags?.split(',').slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[11px] px-3 py-1 bg-black/40 rounded-lg border border-[#00f5ff]/20 text-[#00f5ff]/80 font-mono uppercase font-bold tracking-wider hover:border-[#00f5ff] transition-colors">
                                                #{tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {selectedStation?.stationid === station.stationid && (
                                    <div className="absolute top-6 right-8 flex gap-1.5">
                                        <motion.div animate={{ height: [6, 18, 6] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 bg-[#00f5ff] rounded-full shadow-[0_0_10px_#00f5ff]" />
                                        <motion.div animate={{ height: [12, 6, 12] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} className="w-1.5 bg-[#00f5ff] rounded-full shadow-[0_0_10px_#00f5ff]" />
                                        <motion.div animate={{ height: [6, 15, 6] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 bg-[#00f5ff] rounded-full shadow-[0_0_10px_#00f5ff]" />
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>

                {stations.length > 0 && (
                    <div className="flex justify-center mt-8 sm:mt-12 mb-12 sm:mb-20">
                        <button
                            onClick={() => loadStations(searchQuery, activeTag, true)}
                            disabled={loadingMore}
                            className="group relative px-6 py-3 sm:px-12 sm:py-5 bg-black border-2 border-[#00f5ff]/40 text-[#00f5ff] rounded-2xl flex items-center gap-3 sm:gap-4 hover:border-[#00f5ff] hover:bg-[#00f5ff]/5 transition-all font-mono uppercase text-xs sm:text-sm tracking-[3px] sm:tracking-[5px] font-black shadow-[0_0_30px_rgba(0,245,255,0.1)] hover:shadow-[0_0_50px_rgba(0,245,255,0.3)] disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-[#00f5ff]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                            {loadingMore ? 'EXPANDING_RANGE...' : 'LOAD_MORE_FREQUENCIES'}
                            <Zap size={20} className="group-hover:animate-bounce" />
                        </button>
                    </div>
                )}
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-3 sm:p-5 md:p-8 bg-gradient-to-t from-[#050508] via-[#050508]/98 to-transparent z-20 pointer-events-none backdrop-blur-xl border-t border-white/5">
                <div className="max-w-[2400px] mx-auto flex flex-col xl:flex-row justify-between items-stretch xl:items-end gap-3 sm:gap-5 md:gap-8">
                    <div className="flex flex-row items-center gap-3 sm:gap-5 md:gap-8 pointer-events-auto glass-panel-deep p-3 sm:p-5 md:p-8 rounded-2xl sm:rounded-3xl border-2 border-white/10 w-full xl:w-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <div className="relative group/play shrink-0">
                            <div className={`w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-xl sm:rounded-2xl bg-black border-2 flex items-center justify-center transition-all duration-700 ${selectedStation ? 'border-[#00f5ff] shadow-[0_0_30px_rgba(0,245,255,0.4)]' : 'border-white/5'}`}>
                                {selectedStation ? (
                                    <motion.div
                                        animate={isPlaying ? {
                                            scale: [1, 1.1, 1],
                                            rotate: [0, 90, 180, 270, 360],
                                            filter: ["drop-shadow(0 0 5px #00f5ff)", "drop-shadow(0 0 20px #00f5ff)", "drop-shadow(0 0 5px #00f5ff)"]
                                        } : {}}
                                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                                    >
                                        <Zap className={`${isPlaying ? "text-[#00f5ff]" : "text-[#00f5ff]/20"}`} size={24} />
                                    </motion.div>
                                ) : (
                                    <Wind className="text-white/5" size={24} />
                                )}
                            </div>

                            {selectedStation && (
                                <button
                                    onClick={togglePlay}
                                    className="absolute inset-0 flex items-center justify-center bg-[#00f5ff]/10 opacity-0 hover:opacity-100 transition-opacity rounded-2xl backdrop-blur-sm"
                                >
                                    {isPlaying ? <Pause size={24} fill="#00f5ff" className="text-[#00f5ff] sm:!w-12 sm:!h-12" /> : <Play size={24} fill="#00f5ff" className="text-[#00f5ff] sm:!w-12 sm:!h-12" />}
                                </button>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                            <div className="flex items-center justify-start gap-2 sm:gap-4 mb-1.5 sm:mb-3">
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-[#00f5ff]/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-md border border-[#00f5ff]/20">
                                    <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#00ffbc] animate-pulse' : 'bg-white/10'}`} />
                                    <p className="text-[9px] sm:text-[11px] font-mono text-[#00f5ff] uppercase tracking-[2px] sm:tracking-[4px] font-black">
                                        {selectedStation ? (isPlaying ? 'LIVE_STREAMING' : 'READY_STANDBY') : 'NO_SIGNAL'}
                                    </p>
                                </div>
                            </div>
                            <h2 className="truncate text-base sm:text-xl md:text-3xl font-black text-white leading-none uppercase tracking-tight mb-1.5 sm:mb-3 italic">
                                {selectedStation?.name || '--- SCANNING ---'}
                            </h2>
                            <div className="flex items-center justify-start gap-2 sm:gap-4">
                                <span className="text-[9px] sm:text-[12px] font-mono text-white/40 uppercase tracking-[1px] sm:tracking-[3px] font-bold">
                                    {selectedStation ? `BR: ${selectedStation.bitrate}KBPS // V: ${Math.round(volume * 100)}%` : 'SYSTEM_IDLE'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 max-w-[1400px] w-full pointer-events-auto glass-panel-deep p-3 sm:p-5 md:p-8 rounded-2xl sm:rounded-3xl border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hidden sm:block">
                        <div className="flex justify-between items-center mb-3 sm:mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-[#00f5ff] rounded-full animate-pulse shadow-[0_0_10px_#00f5ff]" />
                                <span className="text-[10px] sm:text-[12px] font-mono text-[#00f5ff] uppercase tracking-[2px] sm:tracking-[5px] font-black">Spectral_Field_Analyzer.V2</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 bg-black/40 px-3 py-1.5 sm:px-6 sm:py-2 rounded-xl border border-white/10">
                                <Volume2 size={16} className="text-[#00f5ff]" />
                                <input
                                    type="range" min="0" max="1" step="0.01"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="w-20 sm:w-32 md:w-48 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#00f5ff] transition-all hover:bg-white/20"
                                />
                            </div>
                        </div>
                        <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                            <SpectrumVisualizer
                                isActive={isPlaying}
                                frequency={440}
                                signalStrength={selectedStation ? 100 : 15}
                            />
                        </div>
                    </div>

                    <div className="text-right pointer-events-auto glass-panel-deep p-8 rounded-3xl border-2 border-white/10 hidden xl:block shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <div className="font-mono text-[#00f5ff] text-3xl tracking-[8px] flex items-center justify-end gap-4 font-black italic">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                            <div className="relative">
                                <div className="w-3 h-3 bg-[#00f5ff] rounded-full animate-ping opacity-75" />
                                <div className="absolute inset-0 w-3 h-3 bg-[#00f5ff] rounded-full shadow-[0_0_15px_#00f5ff]" />
                            </div>
                        </div>
                        <p className="text-[10px] font-mono text-white/30 mt-2 uppercase tracking-[4px]">Atomic_Clock_Sync_Ok</p>
                    </div>
                </div>
            </footer>

            <audio ref={audioRef} crossOrigin="anonymous" />
        </div>
    );
}
