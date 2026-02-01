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
}

const ResourceNodeCard: React.FC<ResourceNodeCardProps> = ({ node, onCurrentNumberChange, onMaxNumberChange, onClearCurrentNumber, onToggleTracking, onOpenMapLocation, explorationLevel }) => {

    return (
        <div className="resource-node-card">

            <CardHeader node={node} onToggleTracking={onToggleTracking} onClearCurrentNumber={onClearCurrentNumber} onOpenMapLocation={onOpenMapLocation} />

            <CardBody node={node} onCurrentNumberChange={onCurrentNumberChange} onMaxNumberChange={onMaxNumberChange} explorationLevel={explorationLevel} />
        </div>
    );
}

export default ResourceNodeCard;