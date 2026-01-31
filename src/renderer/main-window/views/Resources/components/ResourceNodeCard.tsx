import React from 'react';
import { ResourceNode } from '../types/resources.types';

interface ResourceNodeCardProps {
    node: ResourceNode;
    onCurrentNumberChange: (nodeId: string, number: number) => void;
    onMaxNumberChange: (nodeId: string, max: number) => void;
    onClearCurrentNumber: (nodeId: string) => void;
    onToggleTracking: (nodeId: string) => void;
}

const ResourceNodeCard: React.FC<ResourceNodeCardProps> = ({ node, onCurrentNumberChange, onMaxNumberChange, onClearCurrentNumber, onToggleTracking }) => {

    const tomorrowCount = Math.min(node.current + 1, node.max);

    return (
        <div className="resource-node-card">
            <div className="resource-node-card-header">
                <div className="resource-node-card-info">
                    <div className="resource-node-card-name">
                        {node.name}
                    </div>
                    <div className="resource-node-card-meta">
                        {node.map} • {node.region}
                    </div>
                </div>

                <div className="resource-node-card-header-buttons">
                    <button
                        type="button"
                        className="resource-node-card-toggle-tracking"
                        data-tracked={node.tracked}
                        title={node.tracked ? "Untrack this resource" : "Track this resource"}
                        onClick={() => onToggleTracking(node.id)}
                    >
                        {node.tracked ? '❌ Un-Track' : '📌 Track'}
                    </button>
                    <button
                        type="button"
                        className="resource-node-card-clear"
                        onClick={() => onClearCurrentNumber(node.id)}
                        title="Clear current (keep max)"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div className="resource-node-card-body">
                <div className="resource-node-card-inputs">
                    <label className="resource-node-card-label">
                        Current
                        <input
                            type="number"
                            className="resource-node-card-input"
                            min={0}
                            max={node.max}
                            value={node.current}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Handle empty string - allow it temporarily for better UX
                                if (value === '') {
                                    onCurrentNumberChange(node.id, 0);
                                    return;
                                }
                                const numValue = Number(value);
                                if (!isNaN(numValue)) {
                                    onCurrentNumberChange(node.id, numValue);
                                }
                            }}
                        />
                    </label>

                    <label className="resource-node-card-label">
                        Max
                        <input
                            type="number"
                            className="resource-node-card-input"
                            min={0}
                            value={node.max}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Handle empty string - allow it temporarily for better UX
                                if (value === '') {
                                    onMaxNumberChange(node.id, 0);
                                    return;
                                }
                                const numValue = Number(value);
                                if (!isNaN(numValue)) {
                                    onMaxNumberChange(node.id, numValue);
                                }
                            }}
                        />
                    </label>
                </div>

                <div className="resource-node-card-stats">
                    <div className="resource-node-card-ratio">
                        {node.current} / {node.max}
                    </div>
                    <div className="resource-node-card-tomorrow">
                        Tomorrow:{" "}
                        <span className="resource-node-card-tomorrow-value">
                            {node.current} → {tomorrowCount}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResourceNodeCard;