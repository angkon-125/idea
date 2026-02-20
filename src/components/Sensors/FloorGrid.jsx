import { useState } from 'react';
import './FloorGrid.css';

const INITIAL_FLOORS = Array.from({ length: 50 }).map((_, i) => ({
    id: i.toString(),
    floor: i + 1,
    status: 'stable',
    driftMagnitude: 0.1,
    stabilizing: false,
    tiltX: 0.05,
    tiltY: -0.05,
    tiltZ: 0.01
}));

export function FloorGrid() {
    const [floors] = useState(INITIAL_FLOORS);
    const [selectedFloor, setSelectedFloor] = useState(null);

    const floorRows = [];
    for (let row = 9; row >= 0; row--) {
        const rowFloors = floors.slice(row * 5, (row + 1) * 5);
        floorRows.push(rowFloors);
    }

    const handleFloorClick = (floorId) => {
        setSelectedFloor(selectedFloor === floorId ? null : floorId);
    };

    const getFloorClass = (floor) => {
        let classes = 'floor-cell';
        if (floor.status === 'critical') classes += ' critical';
        else if (floor.status === 'warning') classes += ' warning';
        else classes += ' stable';
        if (selectedFloor === floor.floor) classes += ' selected';
        return classes;
    };

    return (
        <div className="floor-grid-container glass-panel">
            <div className="panel-header">
                <h2 className="panel-title">
                    <span className="title-icon">🏢</span>
                    Structural Status Grid
                </h2>
                <div className="panel-legend">
                    <span className="legend-item stable">● Stable</span>
                </div>
            </div>

            <div className="floor-grid">
                {floorRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="floor-row">
                        <span className="row-label">{5 + rowIndex * 5}</span>
                        {row.map((floor) => (
                            <button
                                key={floor.id}
                                className={getFloorClass(floor)}
                                onClick={() => handleFloorClick(floor.floor)}
                                title={`Floor ${floor.floor}: Stable`}
                            >
                                <span className="floor-number">{floor.floor}</span>
                                <span className="floor-drift">FIXED</span>
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
                                    <span>Status:</span>
                                    <span className="detail-value stable">SECURE</span>
                                </div>
                                <div className="detail-row">
                                    <span>Integrity:</span>
                                    <span className="detail-value">OPTIMAL</span>
                                </div>
                                <div className="detail-row">
                                    <span>Signal:</span>
                                    <span className="detail-value">SYNCED</span>
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
