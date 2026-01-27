import { useGravity } from '../../context/GravityContext';
import './DiagnosticPanel.css';

export function DiagnosticPanel() {
    const { state } = useGravity();
    const { diagnosticLogs, memoryLeaks } = state;

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getLogIcon = (type: string) => {
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
                <h3 className="section-title">Hook Memory Analysis</h3>
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
                                    style={{ width: `${Math.min(100, leak.memoryUsage / 3)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rag-section">
                <h3 className="section-title">RAG Troubleshooting</h3>
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
                            <strong>useGravityStabilizer:</strong> Consider implementing cleanup in useEffect return. Memory accumulation detected in sensor polling loop.
                        </span>
                    </div>
                    <div className="suggestion">
                        <span className="suggestion-icon">🔧</span>
                        <span className="suggestion-text">
                            <strong>Recommended:</strong> Add AbortController to async operations. Current implementation lacks proper cancellation handling.
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
