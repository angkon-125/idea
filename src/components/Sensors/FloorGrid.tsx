import { useGravity } from '../../context/GravityContext';
import './FloorGrid.css';

export function FloorGrid() {
    const { state, stabilizeFloor, dispatch } = useGravity();
    const { floors, selectedFloor } = state;

    // Organize floors into a grid (10 rows x 5 columns, bottom to top)
    const floorRows = [];
    for (let row = 9; row >= 0; row--) {
        const rowFloors = floors.slice(row * 5, (row + 1) * 5);
        floorRows.push(rowFloors);
    }

    const handleFloorClick = (floorId: number) => {
        if (selectedFloor === floorId) {
            dispatch({ type: 'SELECT_FLOOR', payload: null });
        } else {
            dispatch({ type: 'SELECT_FLOOR', payload: floorId });
        }
    };

    const getFloorClass = (floor: typeof floors[0]) => {
        let classes = 'floor-cell';
        if (floor.status === 'critical') classes += ' critical';
        else if (floor.status === 'warning') classes += ' warning';
        else classes += ' stable';
        if (floor.stabilizing) classes += ' stabilizing';
        if (selectedFloor === floor.floor) classes += ' selected';
        return classes;
    };

    return (
        <div className="floor-grid-container glass-panel">
            <div className="panel-header">
                <h2 className="panel-title">
                    <span className="title-icon">🏢</span>
                    Floor Status Grid
                </h2>
                <div className="panel-legend">
                    <span className="legend-item stable">● Stable</span>
                    <span className="legend-item warning">● Warning</span>
                    <span className="legend-item critical">● Critical</span>
                </div>
            </div>

            <div className="floor-grid">
                {floorRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="floor-row">
                        <span className="row-label">{50 - rowIndex * 5}</span>
                        {row.map((floor) => (
                            <button
                                key={floor.id}
                                className={getFloorClass(floor)}
                                onClick={() => handleFloorClick(floor.floor)}
                                title={`Floor ${floor.floor}: ${floor.driftMagnitude.toFixed(1)}° drift`}
                            >
                                <span className="floor-number">{floor.floor}</span>
                                <span className="floor-drift">{floor.driftMagnitude.toFixed(1)}°</span>
                                {floor.stabilizing && <span className="stabilizing-indicator" />}
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            {selectedFloor && (
                <div className="floor-detail-panel">
                    <h3>Floor {selectedFloor} Details</h3>
                    {(() => {
                        const floor = floors.find(f => f.floor === selectedFloor);
                        if (!floor) return null;
                        return (
                            <>
                                <div className="detail-row">
                                    <span>Tilt X:</span>
                                    <span className="detail-value">{floor.tiltX.toFixed(2)}°</span>
                                </div>
                                <div className="detail-row">
                                    <span>Tilt Y:</span>
                                    <span className="detail-value">{floor.tiltY.toFixed(2)}°</span>
                                </div>
                                <div className="detail-row">
                                    <span>Tilt Z:</span>
                                    <span className="detail-value">{floor.tiltZ.toFixed(2)}°</span>
                                </div>
                                <div className="detail-row">
                                    <span>Total Drift:</span>
                                    <span className={`detail-value ${floor.status}`}>{floor.driftMagnitude.toFixed(2)}°</span>
                                </div>
                                <button
                                    className="stabilize-btn"
                                    onClick={() => stabilizeFloor(floor.floor)}
                                    disabled={floor.stabilizing}
                                >
                                    {floor.stabilizing ? 'Stabilizing...' : 'Stabilize Floor'}
                                </button>
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
