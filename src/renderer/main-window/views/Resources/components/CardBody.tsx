import React, { useState } from 'react';
import { ResourceNode } from '../types/resources.types';

interface CardBodyProps {
    node: ResourceNode;
    onCurrentNumberChange: (nodeId: string, number: number) => void;
    onMaxNumberChange: (nodeId: string, max: number) => void;
}

const CardBody: React.FC<CardBodyProps> = ({ node, onCurrentNumberChange, onMaxNumberChange }) => {
    const isMaxedOut = node.current >= node.max;
    const isGrowing = node.current < node.max && node.current >= 0;
    const tomorrowCount = Math.min(node.current + 1, node.max);

    const [isEditingMaxAmount, setIsEditingMaxAmount] = useState(false);
    const [editValue, setEditValue] = useState(node.max.toString());


    const handleMaxAmountClick = () => {
        setIsEditingMaxAmount(true);
        setEditValue(node.max.toString());
    };

    const handleMaxAmountBlur = () => {
        const newValue = parseInt(editValue);
        if (!isNaN(newValue)) {
            onMaxNumberChange(node.id, newValue);
        }
        setIsEditingMaxAmount(false);
    };


    return (
        <div className="resource-node-card-body">

            {/* Container - black background */}
            <div className="resource-node-card-body-container">
                <div className="resource-node-card-body-counter">
                    {/* Current amount / max amount */}
                    <span className="resource-node-card-body-counter-current">{node.current}</span>
                    <span className="resource-node-card-body-counter-divider">/</span>

                    {isEditingMaxAmount ?
                        <input type="number"
                            className="resource-node-card-body-counter-max-input"
                            value={editValue}
                            autoFocus
                            min={1}
                            max={100}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleMaxAmountBlur}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Escape') {
                                    handleMaxAmountBlur();
                                }
                            }}
                        /> : <span className="resource-node-card-body-counter-max" onClick={handleMaxAmountClick}>{node.max}</span>}
                </div>
                <div className="resource-node-card-body-status">
                    {/* Growing / Maxed out */}
                    {isGrowing && <div className="resource-node-card-body-status-growing">.../Growing</div>}
                    {isMaxedOut && <div className="resource-node-card-body-status-maxed-out">.../MAX</div>}
                </div>
                <div className="resource-node-card-body-image">
                    {/* Node's image - inside circular border, if no image, show node's name */}
                    <div className="resource-node-card-body-image-container">
                        {node.nodeImage ? <img src={node.nodeImage} alt={node.name} className="resource-node-card-body-image-img" /> : <span className="resource-node-card-body-image-name">{node.name}</span>}
                    </div>
                </div>
                <div className="resource-node-card-body-refresh-status">
                    {/* Next refresh: curr -> tomorrowCount */}
                    {/* if maxed show: Growth limit reached */}

                    {isMaxedOut && <div className="resource-node-card-body-refresh-status-maxed-out">Growth limit reached</div>}
                    {isGrowing && <div className="resource-node-card-body-refresh-status-growing">
                        <span className="resource-node-card-body-refresh-status-growing-label">Next Refresh:</span>
                        <span className="resource-node-card-body-refresh-status-growing-count">{node.current} → {tomorrowCount}</span>
                    </div>}
                </div>
            </div>
        </div>
    );
};

export default CardBody;