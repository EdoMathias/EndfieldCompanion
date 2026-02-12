/**
 * Marker store
 */

import { useCallback, useState } from 'react';
import {
  createSimpleStore,
  DB_NAME,
} from '../../../../../shared/utils/indexedDBStorage';
import {
  IMarkerData,
  MARKER_TYPE_DICT,
} from '../../../../../shared/data/interactive-map/marker';

const MARKER_STORAGE_KEY = 'endfiled.map.markers';

interface MarkerFilterState {
  activeTypes: string[];
  hideCollected: boolean;
  selectedMarkerId: string | null;
}

function loadFilters(): MarkerFilterState {
  try {
    const saved = localStorage.getItem(MARKER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: if activeTypes is empty (old format), select all
      if (parsed.activeTypes && parsed.activeTypes.length === 0) {
        parsed.activeTypes = Object.keys(MARKER_TYPE_DICT);
      }
      return parsed;
    }
  } catch (error) {
    // Ignore
  }
  return {
    activeTypes: Object.keys(MARKER_TYPE_DICT), // All types selected by default
    hideCollected: false,
    selectedMarkerId: null,
  };
}

function saveFilters(state: Partial<MarkerFilterState>): void {
  try {
    const current = loadFilters();
    const updated = { ...current, ...state };
    localStorage.setItem(MARKER_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    // Ignore
  }
}

export function useMarkerStore() {
  const [activeTypes, setActiveTypesState] = useState<string[]>(
    () => loadFilters().activeTypes,
  );
  const [hideCollected, setHideCollectedState] = useState<boolean>(
    () => loadFilters().hideCollected,
  );
  const [selectedMarkerId, setSelectedMarkerIdState] = useState<string | null>(
    null,
  );

  // Set active filter types
  const setActiveTypes = useCallback((types: string[]) => {
    setActiveTypesState(types);
    saveFilters({ activeTypes: types });
  }, []);

  // Toggle a single type
  const toggleType = useCallback((type: string) => {
    setActiveTypesState((prev) => {
      const newTypes = prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type];
      saveFilters({ activeTypes: newTypes });
      return newTypes;
    });
  }, []);

  // Select all types in a category
  const selectCategory = useCallback((category: string) => {
    const typesInCategory = Object.values(MARKER_TYPE_DICT)
      .filter((t) => t.category.sub === category)
      .map((t) => t.key);

    setActiveTypesState((prev) => {
      const newTypes = [...new Set([...prev, ...typesInCategory])];
      saveFilters({ activeTypes: newTypes });
      return newTypes;
    });
  }, []);

  // Deselect all types in a category
  const deselectCategory = useCallback((category: string) => {
    const typesInCategory = new Set(
      Object.values(MARKER_TYPE_DICT)
        .filter((t) => t.category.sub === category)
        .map((t) => t.key),
    );

    setActiveTypesState((prev) => {
      const newTypes = prev.filter((t) => !typesInCategory.has(t));
      saveFilters({ activeTypes: newTypes });
      return newTypes;
    });
  }, []);

  // Select all types
  const selectAll = useCallback(() => {
    const allTypes = Object.keys(MARKER_TYPE_DICT);
    setActiveTypesState(allTypes);
    saveFilters({ activeTypes: allTypes });
  }, []);

  // Clear all types
  const clearAll = useCallback(() => {
    setActiveTypesState([]);
    saveFilters({ activeTypes: [] });
  }, []);

  // Toggle hide collected
  const setHideCollected = useCallback((hide: boolean) => {
    setHideCollectedState(hide);
    saveFilters({ hideCollected: hide });
  }, []);

  // Check if a type is active
  const isTypeActive = useCallback(
    (typeKey: string) => {
      return activeTypes.includes(typeKey);
    },
    [activeTypes],
  );

  return {
    activeTypes,
    hideCollected,
    selectedMarkerId,
    setActiveTypes,
    toggleType,
    selectCategory,
    deselectCategory,
    selectAll,
    clearAll,
    setHideCollected,
    setSelectedMarkerIdState,
    isTypeActive,
  };
}
