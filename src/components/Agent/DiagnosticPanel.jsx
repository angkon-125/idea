import { useState } from 'react';
import './DiagnosticPanel.css';

const MOCK_LEAKS = [
    { hookName: 'useStationStream', memoryUsage: 1.2, trend: 'stable', leakProbability: 2 },
    { hookName: 'useSpectrumAnalyzer', memoryUsage: 4.5, trend: 'increasing', leakProbability: 15 },
    { hookName: 'useNewsTicker', memoryUsage: 0.8, trend: 'stable', leakProbability: 1 },
];

const MOCK_LOGS = [
    { id: '1', type: 'success', message: 'Main frequency link established', source: 'COMMS', timestamp: Date.now() - 5000 },
    { id: '2', type: 'info', message: 'Spectrum analyzer recalibrated', source: 'AUDIO', timestamp: Date.now() - 3000 },
    { id: '3', type: 'warning', message: 'Signal jitter detected in sector 7', source: 'SYS', timestamp: Date.now() - 1000 },
];

export function DiagnosticPanel() {
    const [diagnosticLogs] = useState(MOCK_LOGS);
    const [memoryLeaks] = useState(MOCK_LEAKS);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getLogIcon = (type) => {
        switch (type) {
            case 'info': return 'ℹ️';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            case 'success': return '✅';
            default: return '📝';
        }
    };

    return (
        <div className="diagnostic-container glass-panel">
            <div className="panel-header">
                <h2 className="panel-title">
                    <span className="title-icon">🔬</span>
                    AI Diagnostic Agent
                </h2>
                <span className="agent-status online">● Online</span>
            </div>

            <div className="memory-leak-section">
                <h3 className="section-title">Module Memory Analysis</h3>
                <div className="leak-list">
                    {memoryLeaks.map((leak, index) => (
                        <div key={index} className={`leak-item ${leak.trend}`}>
                            <div className="leak-header">
                                <span className="leak-name">{leak.hookName}</span>
                                <span className={`leak-probability ${leak.trend}`}>
                                    {leak.leakProbability}% leak risk
                                </span>
                            </div>
                            <div className="leak-details">
                                <div className="leak-stat">
                                    <span className="stat-label">Memory</span>
                                    <span className="stat-value">{leak.memoryUsage.toFixed(1)} MB</span>
                                </div>
                                <div className="leak-stat">
                                    <span className="stat-label">Trend</span>
                                    <span className={`stat-value trend-${leak.trend}`}>
                                        {leak.trend === 'critical' ? '↑↑' : leak.trend === 'increasing' ? '↑' : '→'}
                                        {' '}{leak.trend}
                                    </span>
                                </div>
                            </div>
                            <div className="memory-bar">
                                <div
                                    className={`memory-fill ${leak.trend}`}
                                    style={{ width: `${Math.min(100, leak.memoryUsage * 10)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rag-section">
                <h3 className="section-title">Troubleshooting</h3>
                <div className="rag-status">
                    <div className="rag-indicator">
                        <span className="rag-icon">🧠</span>
                        <span className="rag-label">Local AI Model</span>
                    </div>
                    <span className="rag-state active">Active (Offline Mode)</span>
                </div>
                <div className="rag-suggestions">
                    <div className="suggestion">
                        <span className="suggestion-icon">💡</span>
                        <span className="suggestion-text">
                            <strong>System Optimization:</strong> All data buffers cleared. Network latency within acceptable thresholds for this sector.
                        </span>
                    </div>
                    <div className="suggestion">
                        <span className="suggestion-icon">🔧</span>
                        <span className="suggestion-text">
                            <strong>Scanning:</strong> No anomalies detected in current frequency bands.
                        </span>
                    </div>
                </div>
            </div>

            <div className="log-section">
                <h3 className="section-title">
                    Diagnostic Log
                    <span className="log-count">{diagnosticLogs.length} entries</span>
                </h3>
                <div className="log-list">
                    {diagnosticLogs.slice(0, 15).map((log) => (
                        <div key={log.id} className={`log-entry ${log.type}`}>
                            <span className="log-time">{formatTime(log.timestamp)}</span>
                            <span className="log-icon">{getLogIcon(log.type)}</span>
                            <span className="log-source">[{log.source}]</span>
                            <span className="log-message">{log.message}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
