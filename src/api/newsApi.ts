export interface NewsEvent {
    id: string;
    timestamp: number;
    headline: string;
    category: 'CRITICAL' | 'WARNING' | 'INFO' | 'SYNC';
    content: string;
    location: string;
}

const mockNews: NewsEvent[] = [
    {
        id: 'n1',
        timestamp: Date.now(),
        headline: 'GRAVITY DRIFT DETECTED IN SECTOR 7',
        category: 'CRITICAL',
        content: 'Unstable gravitational fields reported in the lower sectors. Evacuation in progress.',
        location: 'Sector 7G'
    },
    {
        id: 'n2',
        timestamp: Date.now() - 300000,
        headline: 'SYNTH-WAVE STREAM UPLOADED',
        category: 'INFO',
        content: 'New Aether-Net relay established for deep-space listeners.',
        location: 'Global'
    },
    {
        id: 'n3',
        timestamp: Date.now() - 600000,
        headline: 'RECALIBRATION REQUIRED FOR G-SLIDERS',
        category: 'WARNING',
        content: 'System wide maintenance scheduled for anti-gravity stabilizers.',
        location: 'Core'
    },
    {
        id: 'n4',
        timestamp: Date.now() - 1200000,
        headline: 'NEO-DHAKA ENERGY SURGE',
        category: 'CRITICAL',
        content: 'Power grid fluctuations reported. Potential electromagnetic interference with radio signals.',
        location: 'Dhaka'
    }
];

export const fetchGlobalNews = async (): Promise<NewsEvent[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockNews;
};
