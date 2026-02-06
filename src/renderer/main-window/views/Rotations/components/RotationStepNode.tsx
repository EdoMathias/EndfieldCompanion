import React from 'react';
import { RotationStep } from '../types/rotations.types';
import { ACTION_TYPE_CONFIG } from '../consts/rotations.consts';

interface RotationStepNodeProps {
    step: RotationStep;
    index: number;
    isEditing: boolean;
    onClick: () => void;
    onRemove: () => void;
}

const RotationStepNode: React.FC<RotationStepNodeProps> = ({ step, index, isEditing, onClick, onRemove }) => {

    const isEmpty = !step.action;

    return (
        <div className="rotation-step-node">
            <div className="rotation-step-node-circle">
                <button type='button' className={`rotation-step-node-circle-button ${isEmpty ? 'rotation-step-node-circle-button--empty' : ''} ${isEditing ? 'rotation-step-node-circle-button--editing' : ''}`} onClick={onClick}>
                    {isEmpty ? (
                        <>
                            <span className="rotation-step-node-circle-empty">+</span>
                            <span className="rotation-step-node-circle-empty-text">Add Action</span>
                        </>
                    ) : (
                        <>
                            <div className="rotation-step-node-ability">
                                {step.character?.name}
                            </div>
                            <div className="rotation-step-node-action-type">
                                {ACTION_TYPE_CONFIG[step.action?.type].shortLabel}
                            </div>
                        </>
                    )}
                </button>

                {/* Delete step button */}
                <button type='button'
                    className="rotation-step-node-delete-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}>
                    <span className="rotation-step-node-delete-button-icon">×</span>
                </button>
            </div>

            {/* Step number below */}
            <div className="rotation-step-node-number">
                #{index + 1}
            </div>
        </div>
    );
};

export default RotationStepNode;