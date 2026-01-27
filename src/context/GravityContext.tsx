import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';

// Types
export interface FloorSensor {
    id: number;
    floor: number;
    tiltX: number;
    tiltY: number;
    tiltZ: number;
    driftMagnitude: number;
    status: 'stable' | 'warning' | 'critical';
    lastUpdate: number;
    stabilizing: boolean;
}

export interface SystemStatus {
    overallHealth: number;
    activeSensors: number;
    criticalFloors: number[];
    warningFloors: number[];
    avgDrift: number;
    maxDrift: number;
    fieldFrequency: number;
    fieldDistortion: number;
    internetStatus: 'stable' | 'flickering' | 'offline';
    auraActive: boolean;
    audioMonitoringActive: boolean;
    currentFrequency: number;
    activeChannel: 'SENSOR_FEED' | 'COMMS' | 'EMERGENCY' | 'DIAGNOSTIC';
    signalStrength: number;
}

export interface DiagnosticLog {
    id: string;
    timestamp: number;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    source: string;
}

export interface MemoryLeakReport {
    hookName: string;
    memoryUsage: number;
    trend: 'stable' | 'increasing' | 'critical';
    lastGC: number;
    leakProbability: number;
}

export interface RadioStation {
    id: string;
    name: string;
    location: string;
    genre: string;
    frequency: number;
    lat: number;
    lng: number;
    url?: string;
    x: number; // 3D Projective X
    y: number; // 3D Projective Y
    z: number; // 3D Projective Z
    weight: number; // Signal Weight
}

interface GravityState {
    floors: FloorSensor[];
    system: SystemStatus;
    diagnosticLogs: DiagnosticLog[];
    memoryLeaks: MemoryLeakReport[];
    selectedFloor: number | null;
    auraListening: boolean;
    auraResponse: string;
    gConstant: number; // The Gravitational Constant (0 to 9.8)
    stations: RadioStation[];
    activeStationId: string | null;
    userPosition: { x: number; y: number; z: number };
}

type GravityAction =
    | { type: 'UPDATE_FLOOR'; payload: FloorSensor }
    | { type: 'UPDATE_ALL_FLOORS'; payload: FloorSensor[] }
    | { type: 'UPDATE_SYSTEM'; payload: Partial<SystemStatus> }
    | { type: 'ADD_LOG'; payload: DiagnosticLog }
    | { type: 'UPDATE_MEMORY_LEAKS'; payload: MemoryLeakReport[] }
    | { type: 'SELECT_FLOOR'; payload: number | null }
    | { type: 'SET_AURA_LISTENING'; payload: boolean }
    | { type: 'SET_AURA_RESPONSE'; payload: string }
    | { type: 'STABILIZE_FLOOR'; payload: number }
    | { type: 'SET_FREQUENCY'; payload: number }
    | { type: 'SET_CHANNEL'; payload: 'SENSOR_FEED' | 'COMMS' | 'EMERGENCY' | 'DIAGNOSTIC' }
    | { type: 'SET_G_CONSTANT'; payload: number }
    | { type: 'SET_ACTIVE_STATION'; payload: string | null }
    | { type: 'UPDATE_USER_POSITION'; payload: { x: number; y: number; z: number } }
    | { type: 'FLOAT_STATIONS'; payload: { genre?: string; location?: string } }
    | { type: 'EMERGENCY_STABILIZE' };

// Mock global stations
const initialStations: RadioStation[] = [
    { id: '1', name: 'Neo-Dhaka FM', location: 'Dhaka', genre: 'Industrial Synth', frequency: 104.2, lat: 23.8, lng: 90.4, x: 0, y: 0, z: 0, weight: 1.2 },
    { id: '2', name: 'Night City Radio', location: 'Tokyo', genre: 'Cyberpunk', frequency: 88.1, lat: 35.6, lng: 139.6, x: 200, y: 150, z: -50, weight: 0.8 },
    { id: '3', name: 'Lower East Static', location: 'New York', genre: 'Glitch Hop', frequency: 91.5, lat: 40.7, lng: -74.0, x: -300, y: -100, z: 100, weight: 0.6 },
    { id: '4', name: 'Helsinki Frost', location: 'Helsinki', genre: 'Heavy Metal', frequency: 105.7, lat: 60.1, lng: 24.9, x: 50, y: 400, z: -200, weight: 1.5 },
    { id: '5', name: 'Berlin Pulse', location: 'Berlin', genre: 'Techno', frequency: 99.4, lat: 52.5, lng: 13.4, x: -150, y: 250, z: -100, weight: 1.1 },
];

// Initial state
const generateInitialFloors = (): FloorSensor[] => {
    return Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        floor: i + 1,
        tiltX: (Math.random() - 0.5) * 10,
        tiltY: (Math.random() - 0.5) * 10,
        tiltZ: (Math.random() - 0.5) * 5,
        driftMagnitude: Math.random() * 15,
        status: 'stable' as const,
        lastUpdate: Date.now(),
        stabilizing: false,
    }));
};

const initialState: GravityState = {
    floors: generateInitialFloors(),
    system: {
        overallHealth: 72,
        activeSensors: 50,
        criticalFloors: [23, 37, 42],
        warningFloors: [12, 18, 29, 31, 45],
        avgDrift: 8.3,
        maxDrift: 15.2,
        fieldFrequency: 432.5,
        fieldDistortion: 12.5,
        internetStatus: 'flickering',
        auraActive: true,
        audioMonitoringActive: false,
        currentFrequency: 432.5,
        activeChannel: 'SENSOR_FEED',
        signalStrength: 88,
    },
    diagnosticLogs: [
        { id: '1', timestamp: Date.now() - 5000, type: 'warning', message: 'Gravitational drift detected on Floor 23 - 15.2°', source: 'SensorArray' },
        { id: '2', timestamp: Date.now() - 3000, type: 'info', message: 'AURA voice assistant initialized', source: 'VoiceAI' },
        { id: '3', timestamp: Date.now() - 1000, type: 'error', message: 'Memory leak detected in useGravityStabilizer hook', source: 'DiagnosticAgent' },
    ],
    memoryLeaks: [
        { hookName: 'useGravityStabilizer', memoryUsage: 245.6, trend: 'critical', lastGC: Date.now() - 30000, leakProbability: 89 },
        { hookName: 'useSensorPolling', memoryUsage: 128.3, trend: 'increasing', lastGC: Date.now() - 15000, leakProbability: 45 },
        { hookName: 'useFieldAnalyzer', memoryUsage: 64.2, trend: 'stable', lastGC: Date.now() - 5000, leakProbability: 12 },
    ],
    selectedFloor: null,
    auraListening: false,
    auraResponse: '',
    gConstant: 9.8,
    stations: initialStations,
    activeStationId: null,
    userPosition: { x: 0, y: 0, z: 0 },
};

// Reducer
function gravityReducer(state: GravityState, action: GravityAction): GravityState {
    switch (action.type) {
        case 'SET_G_CONSTANT':
            return { ...state, gConstant: action.payload };

        case 'SET_ACTIVE_STATION':
            return { ...state, activeStationId: action.payload };

        case 'UPDATE_USER_POSITION':
            return { ...state, userPosition: action.payload };

        case 'FLOAT_STATIONS':
            // Logic to move specific stations closer to center
            return {
                ...state,
                stations: state.stations.map(s => {
                    const match = (action.payload.genre && s.genre.toLowerCase().includes(action.payload.genre.toLowerCase())) ||
                        (action.payload.location && s.location.toLowerCase().includes(action.payload.location.toLowerCase()));
                    if (match) {
                        return { ...s, x: s.x * 0.2, y: s.y * 0.2, z: s.z * 0.2, weight: 2.0 };
                    }
                    return s;
                })
            };

        case 'UPDATE_FLOOR':
            return {
                ...state,
                floors: state.floors.map(f =>
                    f.id === action.payload.id ? action.payload : f
                ),
            };

        case 'UPDATE_ALL_FLOORS':
            return {
                ...state,
                floors: action.payload,
            };

        case 'UPDATE_SYSTEM':
            return {
                ...state,
                system: { ...state.system, ...action.payload },
            };

        case 'ADD_LOG':
            return {
                ...state,
                diagnosticLogs: [action.payload, ...state.diagnosticLogs].slice(0, 100),
            };

        case 'UPDATE_MEMORY_LEAKS':
            return {
                ...state,
                memoryLeaks: action.payload,
            };

        case 'SELECT_FLOOR':
            return {
                ...state,
                selectedFloor: action.payload,
            };

        case 'SET_AURA_LISTENING':
            return {
                ...state,
                auraListening: action.payload,
            };

        case 'SET_AURA_RESPONSE':
            return {
                ...state,
                auraResponse: action.payload,
            };

        case 'SET_FREQUENCY':
            return {
                ...state,
                system: { ...state.system, currentFrequency: action.payload }
            };

        case 'SET_CHANNEL':
            return {
                ...state,
                system: { ...state.system, activeChannel: action.payload }
            };

        case 'STABILIZE_FLOOR':
            return {
                ...state,
                floors: state.floors.map(f =>
                    f.floor === action.payload ? { ...f, stabilizing: true } : f
                ),
            };

        case 'EMERGENCY_STABILIZE':
            return {
                ...state,
                floors: state.floors.map(f => ({ ...f, stabilizing: true })),
            };

        default:
            return state;
    }
}

// Context
interface GravityContextValue {
    state: GravityState;
    dispatch: React.Dispatch<GravityAction>;
    stabilizeFloor: (floor: number) => void;
    emergencyStabilize: () => void;
    addLog: (type: DiagnosticLog['type'], message: string, source: string) => void;
}

const GravityContext = createContext<GravityContextValue | null>(null);

// Provider
export function GravityProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(gravityReducer, initialState);

    const stabilizeFloor = useCallback((floor: number) => {
        dispatch({ type: 'STABILIZE_FLOOR', payload: floor });
        dispatch({
            type: 'ADD_LOG',
            payload: {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                type: 'info',
                message: `Initiating stabilization sequence for Floor ${floor}`,
                source: 'StabilizerCore',
            },
        });
    }, []);

    const emergencyStabilize = useCallback(() => {
        dispatch({ type: 'EMERGENCY_STABILIZE' });
        dispatch({
            type: 'ADD_LOG',
            payload: {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                type: 'warning',
                message: 'EMERGENCY STABILIZATION ACTIVATED - All floors',
                source: 'EmergencyProtocol',
            },
        });
    }, []);

    const addLog = useCallback((type: DiagnosticLog['type'], message: string, source: string) => {
        dispatch({
            type: 'ADD_LOG',
            payload: {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                type,
                message,
                source,
            },
        });
    }, []);

    // Simulate real-time sensor updates
    useEffect(() => {
        const interval = setInterval(() => {
            const updatedFloors = state.floors.map(floor => {
                if (floor.stabilizing) {
                    // Gradually stabilize
                    const newTiltX = floor.tiltX * 0.95;
                    const newTiltY = floor.tiltY * 0.95;
                    const newTiltZ = floor.tiltZ * 0.95;
                    const newDrift = Math.sqrt(newTiltX ** 2 + newTiltY ** 2);

                    return {
                        ...floor,
                        tiltX: newTiltX,
                        tiltY: newTiltY,
                        tiltZ: newTiltZ,
                        driftMagnitude: newDrift,
                        status: newDrift < 5 ? 'stable' as const : newDrift < 10 ? 'warning' as const : 'critical' as const,
                        stabilizing: newDrift > 0.5,
                        lastUpdate: Date.now(),
                    };
                } else {
                    // Natural drift simulation
                    const driftChange = (Math.random() - 0.48) * 0.5;
                    const newTiltX = Math.max(-20, Math.min(20, floor.tiltX + driftChange));
                    const newTiltY = Math.max(-20, Math.min(20, floor.tiltY + driftChange));
                    const newDrift = Math.sqrt(newTiltX ** 2 + newTiltY ** 2);

                    return {
                        ...floor,
                        tiltX: newTiltX,
                        tiltY: newTiltY,
                        driftMagnitude: newDrift,
                        status: newDrift < 5 ? 'stable' as const : newDrift < 10 ? 'warning' as const : 'critical' as const,
                        lastUpdate: Date.now(),
                    };
                }
            });

            dispatch({ type: 'UPDATE_ALL_FLOORS', payload: updatedFloors });

            // Update system stats
            const criticalFloors = updatedFloors.filter(f => f.status === 'critical').map(f => f.floor);
            const warningFloors = updatedFloors.filter(f => f.status === 'warning').map(f => f.floor);
            const avgDrift = updatedFloors.reduce((sum, f) => sum + f.driftMagnitude, 0) / updatedFloors.length;
            const maxDrift = Math.max(...updatedFloors.map(f => f.driftMagnitude));

            dispatch({
                type: 'UPDATE_SYSTEM',
                payload: {
                    criticalFloors,
                    warningFloors,
                    avgDrift,
                    maxDrift,
                    overallHealth: Math.max(0, 100 - (criticalFloors.length * 10) - (warningFloors.length * 3)),
                    fieldDistortion: 5 + (maxDrift * 0.8) + (Math.random() * 2),
                },
            });
        }, 100); // Sub-100ms updates

        return () => clearInterval(interval);
    }, [state.floors]);

    return (
        <GravityContext.Provider value={{ state, dispatch, stabilizeFloor, emergencyStabilize, addLog }}>
            {children}
        </GravityContext.Provider>
    );
}

// Hook
export function useGravity() {
    const context = useContext(GravityContext);
    if (!context) {
        throw new Error('useGravity must be used within a GravityProvider');
    }
    return context;
}
