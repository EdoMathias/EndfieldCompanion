import React, { useEffect, useRef, useState } from 'react';
import { useRotationsStore } from './hooks/useRotationsStore';
import { useFTUE } from '../../../contexts/FTUEContext';
import { FTUETooltip } from '../../../components';
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
    const { startRotationsFTUE } = useFTUE();
    const [isSquadSelectionModalOpen, setIsSquadSelectionModalOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Kick off the rotations FTUE the first time the user navigates here
    useEffect(() => {
        startRotationsFTUE();
    }, [startRotationsFTUE]);

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

            {/* Rotations FTUE tooltips */}
            <FTUETooltip
                step="rotations_header"
                title="Squad & Presets"
                message="Pick your squad and save or load rotation presets. Selecting a preset automatically displays it in the dedicated in-game window."
                position="bottom"
                targetSelector='[data-ftue="rotations-header"]'
            />
            <FTUETooltip
                step="rotations_editor"
                title="Rotation Editor"
                message="Build your rotation step by step — tap + to add a step, then assign a character ability to each one."
                position="top"
                targetSelector='[data-ftue="rotations-editor"]'
            />
        </section>
    );
};

export default Rotations;
