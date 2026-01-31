import React from 'react';
import { ResourceNode } from '../types/resources.types';
import RareOresIcon from './RareOresIcon';
import RareGrowthIcon from './RareGrowthIcon';

interface CardHeaderProps {
    node: ResourceNode;
    onToggleTracking: (nodeId: string) => void;
    onClearCurrentNumber: (nodeId: string) => void;
    onOpenMapLocation: () => void;
}

const CardHeader: React.FC<CardHeaderProps> = ({ node, onToggleTracking, onClearCurrentNumber, onOpenMapLocation }) => {

    return (
        <div className="resource-node-card-header">
            <div className="resource-node-card-title-row">
                <div className="resource-node-card-icon">
                    {node.type === "Rare Growth" ? <RareGrowthIcon /> : <RareOresIcon />}
                </div>
                <div className="resource-node-card-name">
                    {node.name}
                </div>
            </div>
            <div className="resource-node-controls">
                <button type="button" className="resource-node-card-map-location" onClick={onOpenMapLocation}>
                    📍 {node.map} • {node.region}
                </button>
                <button type="button" className="resource-node-card-toggle-tracking" onClick={() => onToggleTracking(node.id)}>
                    {node.tracked ? '❌ Un-Track' : '📌 Track'}
                </button>
                <button type="button" className="resource-node-card-clear" onClick={() => onClearCurrentNumber(node.id)}>Clear</button>
            </div>
        </div>
    );
};

export default CardHeader;