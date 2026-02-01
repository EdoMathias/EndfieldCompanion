import React from 'react';
import { ResourceNode } from '../types/resources.types';
import ResourceNodeCard from './ResourceNodeCard';

interface RegionGroupProps {
    region: string;
    nodes: ResourceNode[];
    isExpanded: boolean;
    onToggleExpanded: () => void;
    onCurrentNumberChange: (nodeId: string, number: number) => void;
    onMaxNumberChange: (nodeId: string, max: number) => void;
    onClearCurrentNumber: (nodeId: string) => void;
    onToggleTracking: (nodeId: string) => void;
    onOpenMapLocation: (node: ResourceNode) => void;
    explorationLevel: number;
}

const RegionGroup: React.FC<RegionGroupProps> = ({
    region,
    nodes,
    isExpanded,
    onToggleExpanded,
    onCurrentNumberChange,
    onMaxNumberChange,
    onClearCurrentNumber,
    onToggleTracking,
    onOpenMapLocation,
    explorationLevel,
}) => {
    const maxedNodesCount = nodes.filter(node => node.current >= node.max && node.max > 0).length;
    const totalNodes = nodes.length;

    const handleClearRegion = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent toggling the region when clicking the button
        nodes.forEach(node => {
            onClearCurrentNumber(node.id);
        });
    };

    return (
        <div className="region-group">
            <button
                className="region-group-header"
                onClick={onToggleExpanded}
                aria-expanded={isExpanded}
            >
                <div className="region-group-header-left">
                    <span className="region-group-icon">{isExpanded ? '▼' : '▶'}</span>
                    <span className="region-group-title">{region}</span>
                </div>
                <div className="region-group-header-right">
                    <span className="region-group-count">{maxedNodesCount}/{totalNodes} maxed</span>
                    <button
                        className="region-group-clear-button"
                        onClick={handleClearRegion}
                        title="Clear all nodes in this region"
                    >
                        Clear Region
                    </button>
                </div>
            </button>

            {isExpanded && (
                <div className="region-group-content">
                    <div className="resources-grid">
                        {nodes.map(node => (
                            <ResourceNodeCard
                                key={node.id}
                                node={node}
                                onCurrentNumberChange={onCurrentNumberChange}
                                onMaxNumberChange={onMaxNumberChange}
                                onClearCurrentNumber={onClearCurrentNumber}
                                onToggleTracking={onToggleTracking}
                                onOpenMapLocation={() => onOpenMapLocation(node)}
                                explorationLevel={explorationLevel}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegionGroup;
