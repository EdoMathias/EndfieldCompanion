import { useCallback, useEffect, useState } from "react";
import { Character, CharacterAction, Rotation, RotationActionType, RotationStep } from "../types/rotations.types";
import { STORAGE_CURRENT_ROTATION, STORAGE_CURRENT_SQUAD } from "../consts/rotations.consts";
import characters from "../../../../../shared/data/characters.json";

/**
 * Local storage key for the rotations presets.
 */
const STORAGE_ROTATIONS_PRESETS = 'endfield.rotations.presets.v1';

/**
 * Local storage key for the selected preset id.
 */
const STORAGE_SELECTED_PRESET = 'endfield.rotations.selectedPreset.v1';

/**
 * Local storage key for the characters data.
 */
const STORAGE_CHARACTERS = 'endfield.characters.v1';

const DEFAULT_CHARACTERS: Character[] = characters.characters.map(character => ({
    id: character.id,
    name: character.name,
    image: character.image,
    actions: character.actions.map(action => ({
        id: action.id,
        name: action.name,
        type: action.type as RotationActionType,
        description: action.description,
        image: action.image,
    })),
}));

/**
 * Loads the characters data from the local storage.
 * @returns The characters data
 */
function loadCharactersData(): Character[] {
    try {
        const characters = localStorage.getItem(STORAGE_CHARACTERS);
        if (!characters) {
            return DEFAULT_CHARACTERS;
        }
        const parsedCharacters = JSON.parse(characters);
        if (!Array.isArray(parsedCharacters) || parsedCharacters.length === 0) {
            return DEFAULT_CHARACTERS;
        }
        return parsedCharacters as Character[];
    }
    catch (error) {
        console.error('Error loading characters data from local storage:', error);
        return DEFAULT_CHARACTERS;
    }
}

/**
 * Loads the current rotation from the local storage.
 * @returns The current rotation
 */
function loadCurrentRotation(): Rotation | null {
    try {
        const currentRotation = localStorage.getItem(STORAGE_CURRENT_ROTATION);
        if (!currentRotation) {
            return null;
        }
        const parsedCurrentRotation = JSON.parse(currentRotation);
        if (!parsedCurrentRotation) {
            return null;
        }
        return parsedCurrentRotation as Rotation;
    }
    catch (error) {
        console.error('Error loading current rotation from local storage:', error);
        return null;
    }
}

/**
 * Loads the rotations presets from the local storage.
 * @returns The rotations presets
 */
function loadRotationsPresets(): Rotation[] {
    try {
        const rotationsPresets = localStorage.getItem(STORAGE_ROTATIONS_PRESETS);
        if (!rotationsPresets) {
            return [];
        }
        const parsedRotationsPresets = JSON.parse(rotationsPresets);
        if (!Array.isArray(parsedRotationsPresets) || parsedRotationsPresets.length === 0) {
            return [];
        }
        return parsedRotationsPresets as Rotation[];
    }
    catch (error) {
        console.error('Error loading rotations presets from local storage:', error);
        return [];
    }
}

/**
 * Loads the current squad from the local storage.
 * @returns The current squad
 */
function loadSquad(): Character[] {
    try {
        const squad = localStorage.getItem(STORAGE_CURRENT_SQUAD);
        if (!squad) return [];
        const parsed = JSON.parse(squad);
        if (!Array.isArray(parsed)) return [];
        return parsed as Character[];
    }
    catch (error) {
        console.error('Error loading squad from local storage:', error);
        return [];
    }
}

export function useRotationsStore() {
    const [characters, setCharactersState] = useState<Character[]>(loadCharactersData());
    const [currentRotation, setCurrentRotationState] = useState<Rotation | null>(loadCurrentRotation());
    const [rotationsPresets, setRotationsPresetsState] = useState<Rotation[]>(loadRotationsPresets());
    const [squad, setSquadState] = useState<Character[]>(() => loadSquad());
    const [selectedPresetId, setSelectedPresetIdState] = useState<string>(
        () => localStorage.getItem(STORAGE_SELECTED_PRESET) ?? ''
    );

    // Persist the characters to the local storage.
    useEffect(() => {
        localStorage.setItem(STORAGE_CHARACTERS, JSON.stringify(characters));
    }, [characters]);

    // Persist the current rotation to the local storage.
    useEffect(() => {
        localStorage.setItem(STORAGE_CURRENT_ROTATION, JSON.stringify(currentRotation));
    }, [currentRotation]);

    // Persist the rotations presets to the local storage.
    useEffect(() => {
        localStorage.setItem(STORAGE_ROTATIONS_PRESETS, JSON.stringify(rotationsPresets));
    }, [rotationsPresets]);

    // Persist the squad to the local storage.
    useEffect(() => {
        localStorage.setItem(STORAGE_CURRENT_SQUAD, JSON.stringify(squad));
    }, [squad]);

    // Persist the selected preset id to the local storage.
    useEffect(() => {
        localStorage.setItem(STORAGE_SELECTED_PRESET, selectedPresetId);
    }, [selectedPresetId]);

    /**
     * Adds a character to the squad.
     * Characters are stored in an array of objects
     */
    const addCharacterToSquad = useCallback((character: Character) => {
        setSquadState(prevSquad => {
            if (prevSquad.length >= 4) return prevSquad;
            if (prevSquad.some(c => c.id === character.id)) return prevSquad;
            return [...prevSquad, character];
        });
    }, []);

    /**
     * Removes a character from the squad.
     */
    const removeCharacterFromSquad = useCallback((characterId: string) => {
        // Remove the character's steps from the current rotation.
        setCurrentRotationState(prevRotation => {
            if (!prevRotation) return { id: '', name: '', steps: [] };
            return { ...prevRotation, steps: prevRotation.steps.filter(step => step.character?.id !== characterId) };
        });


        setSquadState(prevSquad =>
            prevSquad.filter(character => character.id !== characterId)
        );
    }, []);

    /**
     * Sets the current rotation.
     */
    const setCurrentRotation = useCallback((rotation: Rotation) => {
        setCurrentRotationState(rotation);
    }, []);

    /**
     * Clears the current rotation.
     */
    const clearCurrentRotation = useCallback(() => {
        setCurrentRotationState(null);
    }, []);

    /**
     * Saves the current rotation as a preset.
     * @param name The name for the preset
     */
    const setSelectedPresetId = useCallback((presetId: string) => {
        setSelectedPresetIdState(presetId);
    }, []);

    const saveCurrentRotationAsPreset = useCallback((name: string): string | null => {
        if (!currentRotation) return null;
        const preset: Rotation = {
            ...currentRotation,
            id: `preset-${Date.now()}`,
            name,
        };
        setRotationsPresetsState(prevPresets => [...prevPresets, preset]);
        setSelectedPresetIdState(preset.id);
        return preset.id;
    }, [currentRotation]);

    /**
     * Removes a preset from the rotations presets.
     * @param presetId The id of the preset to remove
     */
    const removePreset = useCallback((presetId: string) => {
        setRotationsPresetsState(prevPresets => prevPresets.filter(preset => preset.id !== presetId));
        setSelectedPresetIdState(prev => prev === presetId ? '' : prev);
    }, []);

    /**
     * Loads a preset into the current rotation and sets the squad to the characters used in that preset.
     * @param presetId The id of the preset to load
     */
    const loadPreset = useCallback((presetId: string) => {
        const preset = rotationsPresets.find(p => p.id === presetId);
        if (!preset) {
            setCurrentRotationState({ id: '', name: '', steps: [] });
            return;
        }
        setCurrentRotationState({
            ...preset,
            steps: preset.steps.map(step => ({ ...step, action: step.action, character: step.character ?? undefined })),
        });
        // Set squad from characters used in the preset (unique, order of first appearance, max 4)
        const squadFromPreset: Character[] = [];
        const seen = new Set<string>();
        for (const step of preset.steps) {
            if (step.character && !seen.has(step.character.id)) {
                seen.add(step.character.id);
                squadFromPreset.push(step.character);
                if (squadFromPreset.length >= 4) break;
            }
        }
        setSquadState(squadFromPreset);
    }, [rotationsPresets]);

    /**
     * Adds a step to the current rotation.
     * @param step The step to add
     */
    const addStepToCurrentRotation = useCallback((step: RotationStep) => {
        setCurrentRotationState(prevRotation => {
            if (!prevRotation) return { id: '', name: '', steps: [] };
            return { ...prevRotation, steps: [...prevRotation.steps, step] };
        });
    }, []);

    /**
     * Removes a step from the current rotation.
     * @param stepId The id of the step to remove
     */
    const removeStepFromCurrentRotation = useCallback((stepId: string) => {
        setCurrentRotationState(prevRotation => {
            if (!prevRotation) return { id: '', name: '', steps: [] };
            return { ...prevRotation, steps: prevRotation.steps.filter(step => step.id !== stepId) };
        });
    }, []);

    /**
     * Sets the action for a step.
     * @param stepId The id of the step to set the action for
     * @param action The action to set
     * @param character The character to set the action for
     */
    const setStepAction = useCallback((stepId: string, action: CharacterAction, character: Character) => {
        setCurrentRotationState(prevRotation => {
            if (!prevRotation) return { id: '', name: '', steps: [] };
            return { ...prevRotation, steps: prevRotation.steps.map(step => step.id === stepId ? { ...step, action, character } : step) };
        });
    }, []);

    return {
        characters,
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
    };
}