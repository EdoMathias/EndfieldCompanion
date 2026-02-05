import { useCallback, useEffect, useState } from "react";
import { Character, Rotation, RotationActionType, RotationStep } from "../types/rotations.types";
import characters from "../../../../../shared/data/characters.json";

/**
 * Local storage key for the current rotation.
 */
const STORAGE_CURRENT_ROTATION = 'endfield.rotations.current.v1';

/**
 * Local storage key for the rotations presets.
 */
const STORAGE_ROTATIONS_PRESETS = 'endfield.rotations.presets.v1';

/**
 * Local storage key for the characters data.
 */
const STORAGE_CHARACTERS = 'endfield.characters.v1';

/**
 * Local storage key for the squad.
 */
const STORAGE_CURRENT_SQUAD = 'endfield.current.squad.v1';

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

    return {
        characters,
        squad,
        currentRotation,
        rotationsPresets,
        addCharacterToSquad,
        removeCharacterFromSquad,
        setCurrentRotation,
    };
}