import React, { useRef, useState } from 'react';
import { useRotationsStore } from './hooks/useRotationsStore';
import RotationsHeader from './components/RotationsHeader';
import SquadSelectionModal from './components/SquadSelectionModal';
import RotationsEditor from './components/RotationsEditor';

const Rotations: React.FC = () => {

    const { characters,
        squad,
        currentRotation,
        rotationsPresets,
        selectedPresetId,
        addCharacterToSquad,
        removeCharacterFromSquad,
        setCurrentRotation,
        clearCurrentRotation,
        saveCurrentRotationAsPreset,
        removePreset,
        loadPreset,
        setSelectedPresetId,
        addStepToCurrentRotation,
        removeStepFromCurrentRotation,
        setStepAction,
    } = useRotationsStore();
    const [isSquadSelectionModalOpen, setIsSquadSelectionModalOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <section className="rotations-container" ref={containerRef}>
            <RotationsHeader
                characters={characters}
                squad={squad}
                onAddCharacterToSquad={addCharacterToSquad}
                onRemoveCharacterFromSquad={removeCharacterFromSquad}
                currentRotation={currentRotation}
                onCurrentRotationChange={setCurrentRotation}
                rotationsPresets={rotationsPresets}
                selectedPresetId={selectedPresetId}
                onSelectedPresetIdChange={setSelectedPresetId}
                onSavePreset={saveCurrentRotationAsPreset}
                onRemovePreset={removePreset}
                onLoadPreset={loadPreset}
                onEditSquad={() => setIsSquadSelectionModalOpen(true)}
                containerRef={containerRef}
            />

            <SquadSelectionModal
                isOpen={isSquadSelectionModalOpen}
                onClose={() => setIsSquadSelectionModalOpen(false)}
                characters={characters}
                squad={squad}
                onAddCharacterToSquad={addCharacterToSquad}
                onRemoveCharacterFromSquad={removeCharacterFromSquad}
                containerRef={containerRef}
            />

            <RotationsEditor
                squad={squad}
                currentRotation={currentRotation}
                onAddRotationStep={addStepToCurrentRotation}
                onRemoveRotationStep={removeStepFromCurrentRotation}
                onSetRotationStepAction={setStepAction}
                onClearCurrentRotation={clearCurrentRotation}
            />
        </section>
    );
};

export default Rotations;
