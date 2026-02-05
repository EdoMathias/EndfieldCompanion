import React, { useRef, useState } from 'react';
import { useRotationsStore } from './hooks/useRotationsStore';
import RotationsHeader from './components/RotationsHeader';
import SquadSelectionModal from './components/SquadSelectionModal';

const Rotations: React.FC = () => {

    const { characters, squad, currentRotation, rotationsPresets, addCharacterToSquad, removeCharacterFromSquad, setCurrentRotation } = useRotationsStore();
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
                onEditSquad={() => setIsSquadSelectionModalOpen(true)} />

            <SquadSelectionModal
                isOpen={isSquadSelectionModalOpen}
                onClose={() => setIsSquadSelectionModalOpen(false)}
                characters={characters}
                squad={squad}
                onAddCharacterToSquad={addCharacterToSquad}
                onRemoveCharacterFromSquad={removeCharacterFromSquad}
                containerRef={containerRef}
            />
        </section>
    );
};

export default Rotations;
