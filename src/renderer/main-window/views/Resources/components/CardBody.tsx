import React, { useState, useEffect } from 'react';
import { ResourceNode } from '../types/resources.types';

interface CardBodyProps {
    node: ResourceNode;
    onCurrentNumberChange: (nodeId: string, number: number) => void;
    onMaxNumberChange: (nodeId: string, max: number) => void;
    explorationLevel: number;
}

const CardBody: React.FC<CardBodyProps> = ({ node, onCurrentNumberChange, onMaxNumberChange, explorationLevel }) => {
    const isMaxedOut = node.current >= node.max;
    const isGrowing = node.current < node.max && node.current >= 0;
    // If exploration level is 7, increment by 2 per day instead of 1
    const incrementPerDay = explorationLevel === 7 ? 2 : 1;
    const tomorrowCount = Math.min(node.current + incrementPerDay, node.max);

    const [isEditingMaxAmount, setIsEditingMaxAmount] = useState(false);
    const [editMaxValue, setEditMaxValue] = useState(node.max.toString());
    const [isEditingCurrentAmount, setIsEditingCurrentAmount] = useState(false);
    const [editCurrentValue, setEditCurrentValue] = useState(node.current.toString());

    // Sync edit values when node changes (only when not editing)
    useEffect(() => {
        if (!isEditingMaxAmount) {
            setEditMaxValue(node.max.toString());
        }
    }, [node.max, isEditingMaxAmount]);

    useEffect(() => {
        if (!isEditingCurrentAmount) {
            setEditCurrentValue(node.current.toString());
        }
    }, [node.current, isEditingCurrentAmount]);

    const handleMaxAmountClick = () => {
        setIsEditingMaxAmount(true);
        setEditMaxValue(node.max.toString());
    };

    const handleMaxAmountBlur = () => {
        const newValue = parseInt(editMaxValue);
        if (!isNaN(newValue)) {
            onMaxNumberChange(node.id, newValue);
        }
        setIsEditingMaxAmount(false);
    };

    const handleCurrentAmountClick = () => {
        setIsEditingCurrentAmount(true);
        setEditCurrentValue(node.current.toString());
    };

    const handleCurrentAmountBlur = () => {
        const newValue = parseInt(editCurrentValue);
        if (!isNaN(newValue)) {
            onCurrentNumberChange(node.id, newValue);
        }
        setIsEditingCurrentAmount(false);
    };


    return (
        <div className="resource-node-card-body">

            {/* Container - with map image background */}
            <div 
                className="resource-node-card-body-container"
                style={{
                    backgroundImage: node.mapLocationImage ? `url(${node.mapLocationImage})` : undefined,
                }}
            >
                <div className="resource-node-card-body-counter">
                    {/* Current amount / max amount */}
                    {isEditingCurrentAmount ?
                        <input type="number"
                            className="resource-node-card-body-counter-current-input"
                            value={editCurrentValue}
                            autoFocus
                            min={0}
                            max={node.max}
                            onChange={(e) => setEditCurrentValue(e.target.value)}
                            onBlur={handleCurrentAmountBlur}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Escape') {
                                    handleCurrentAmountBlur();
                                }
                            }}
                        /> : <span className="resource-node-card-body-counter-current" role="button" tabIndex={0} onClick={handleCurrentAmountClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCurrentAmountClick(); } }}>{node.current}</span>}
                    <span className="resource-node-card-body-counter-divider">/</span>

                    {isEditingMaxAmount ?
                        <input type="number"
                            className="resource-node-card-body-counter-max-input"
                            value={editMaxValue}
                            autoFocus
                            min={1}
                            max={100}
                            onChange={(e) => setEditMaxValue(e.target.value)}
                            onBlur={handleMaxAmountBlur}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Escape') {
                                    handleMaxAmountBlur();
                                }
                            }}
                        /> : <span className="resource-node-card-body-counter-max" role="button" tabIndex={0} onClick={handleMaxAmountClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMaxAmountClick(); } }}>{node.max}</span>}
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
                        <div className="resource-node-card-body-refresh-status-growing-counts">
                            <span className="resource-node-card-body-refresh-status-growing-current-count">{node.current} → </span>
                            <span className="resource-node-card-body-refresh-status-growing-tomorrow-count">{tomorrowCount}</span>
                        </div>
                    </div>}
                </div>
            </div>
        </div>
    );
};

export default CardBody;