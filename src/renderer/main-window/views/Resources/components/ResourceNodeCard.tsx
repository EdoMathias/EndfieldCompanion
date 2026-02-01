import React from 'react';
import { ResourceNode } from '../types/resources.types';
import CardHeader from './CardHeader';
import CardBody from './CardBody';

interface ResourceNodeCardProps {
    node: ResourceNode;
    onCurrentNumberChange: (nodeId: string, number: number) => void;
    onMaxNumberChange: (nodeId: string, max: number) => void;
    onClearCurrentNumber: (nodeId: string) => void;
    onToggleTracking: (nodeId: string) => void;
    onOpenMapLocation: () => void;
    explorationLevel: number;
    /** When true, marks this card for FTUE "map card" walkthrough */
    ftueMapCard?: boolean;
    /** When true, marks the "Show on Map" button for FTUE walkthrough */
    ftueOnMapButton?: boolean;
}

const ResourceNodeCard: React.FC<ResourceNodeCardProps> = ({ node, onCurrentNumberChange, onMaxNumberChange, onClearCurrentNumber, onToggleTracking, onOpenMapLocation, explorationLevel, ftueMapCard, ftueOnMapButton }) => {

    return (
        <div
            className="resource-node-card"
            {...(ftueMapCard ? { 'data-ftue': 'resources-map-card' as const } : {})}
        >
            <CardHeader
                node={node}
                onToggleTracking={onToggleTracking}
                onClearCurrentNumber={onClearCurrentNumber}
                onOpenMapLocation={onOpenMapLocation}
                ftueOnMapButton={ftueOnMapButton}
            />

            <CardBody node={node} onCurrentNumberChange={onCurrentNumberChange} onMaxNumberChange={onMaxNumberChange} explorationLevel={explorationLevel} />
        </div>
    );
}

export default ResourceNodeCard;