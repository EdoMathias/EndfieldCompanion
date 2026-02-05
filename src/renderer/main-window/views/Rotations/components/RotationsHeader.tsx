import React from 'react';
import { Character, Rotation } from '../types/rotations.types';
import RotationsOperatorCard from './RotationsOperatorCard';

interface RotationsHeaderProps {
    characters: Character[];
    squad: Character[];
    onAddCharacterToSquad: (character: Character) => void;
    onRemoveCharacterFromSquad: (characterId: string) => void;
    currentRotation: Rotation;
    onCurrentRotationChange: (rotation: Rotation) => void;
    rotationsPresets: Rotation[];
    onEditSquad: () => void;
}

const RotationsHeader: React.FC<RotationsHeaderProps> = ({ squad, onAddCharacterToSquad, onRemoveCharacterFromSquad, currentRotation, onCurrentRotationChange, rotationsPresets, onEditSquad }) => {
    return (
        <div className="rotations-header">
            {/* Row 1: Title */}
            <div className="rotations-header-row-1">
                <h1 className="rotations-header-title">Rotations</h1>
            </div>

            {/* Row 2: Import/Export Buttons + Load from Preset + New Preset Button */}
            <div className="rotations-header-row-2">
                <button type="button" className="rotations-header-button">Import</button>
                <button type="button" className="rotations-header-button">Export</button>
                <label className="rotations-header-label">
                    Preset
                    <select className="rotations-header-select">
                        {rotationsPresets.map(preset => (
                            <option key={preset.id} value={preset.id}>{preset.name}</option>
                        ))}
                    </select>
                </label>
                <button type="button" className="rotations-header-button">New Preset</button>
            </div>

            {/* Row 3: Squad selection + Edit Squad button */}
            <div className="rotations-header-row-3">
                <div className="rotations-header-squad-selection">
                    {squad.map(character => (
                        <RotationsOperatorCard key={character.id} character={character} />
                    ))}
                </div>
                <button type="button" className="rotations-header-button" onClick={onEditSquad}>Edit Squad</button>
            </div>
        </div>
    );
}

export default RotationsHeader;