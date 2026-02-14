import { useCallback, useEffect, useState } from 'react';
import {
  ResourceNode,
  ResourceType,
  ServerRegion,
} from '../types/resources.types';
import { diffDaysKeys, getMostRecentResetKey } from '../utils/resetTime';
import resources from '../../../../../shared/data/resources.json';

/**
 * Local storage keys for the resources store.
 */
const STORAGE_NODES = 'endfield.resources.nodes.v1';

/**
 * Local storage key for the server region.
 */
const STORAGE_SERVER = 'endfield.resources.server.v1';

/**
 * Local storage key for the selected map.
 */
const STORAGE_MAP = 'endfield.resources.map.v1';

/**
 * Local storage key for the last applied reset key.
 * Will help to determine how many items to increment by when the app launches.
 */
const STORAGE_LAST_RESET_KEY = 'endfield.resources.lastAppliedResetKey.v1';

/**
 * Local storage key for collapsed region states.
 */
const STORAGE_COLLAPSED_REGIONS = 'endfield.resources.collapsedRegions.v1';

/**
 * Local storage key for exploration level.
 */
const STORAGE_EXPLORATION_LEVEL = 'endfield.resources.explorationLevel.v1';

const DEFAULT_NODES: ResourceNode[] = resources.resources.map((resource) => ({
  id: resource.id,
  name: resource.name,
  type: resource.type as ResourceType,
  map: resource.map,
  region: resource.region,
  mapLocationImage: resource.mapLocationImage,
  nodeImage: resource.nodeImage,
  max: resource.max,
  current: resource.current,
  enabled: resource.enabled,
  tracked: resource.tracked,
  order: resource.order,
}));

/**
 * Loads the nodes from the local storage.
 * @returns The nodes
 */
function loadNodes(): ResourceNode[] {
  try {
    const nodes = localStorage.getItem(STORAGE_NODES);
    if (!nodes) {
      return DEFAULT_NODES;
    }

    const parsedNodes = JSON.parse(nodes);
    if (!Array.isArray(parsedNodes) || parsedNodes.length === 0) {
      return DEFAULT_NODES;
    }

    const defaultsById = new Map(DEFAULT_NODES.map((node) => [node.id, node]));
    const migrated = (parsedNodes as ResourceNode[]).map((node) => {
      const defaults = defaultsById.get(node.id);
      if (!defaults) {
        return node;
      }

      return {
        ...defaults,
        ...node,
        // Always refresh static data from defaults after updates.
        name: defaults.name,
        type: defaults.type,
        map: defaults.map,
        region: defaults.region,
        mapLocationImage: defaults.mapLocationImage,
        nodeImage: defaults.nodeImage,
        order: defaults.order,
      };
    });

    // Add any new nodes introduced in updated data.
    const knownIds = new Set(migrated.map((node) => node.id));
    const missing = DEFAULT_NODES.filter((node) => !knownIds.has(node.id));
    return migrated.concat(missing);
  } catch (error) {
    console.error('Error loading nodes from local storage:', error);
    return DEFAULT_NODES;
  }
}

/**
 * Loads the server region from the local storage.
 * @returns The server region
 */
function loadServerRegion(): ServerRegion {
  const serverRegion = localStorage.getItem(STORAGE_SERVER);

  if (serverRegion === 'ASIA_UTC8' || serverRegion === 'AMER_EU_UTC_MINUS_5') {
    return serverRegion;
  }

  return 'AMER_EU_UTC_MINUS_5';
}

/**
 * Loads the selected map from the local storage.
 * @returns The selected map
 */
function loadSelectedMap(): string {
  const map = localStorage.getItem(STORAGE_MAP);

  if (map === 'Valley IV' || map === 'Wuling') {
    return map;
  }

  return 'Valley IV'; // Default to Valley IV
}

/**
 * Loads the collapsed regions from the local storage.
 * @returns A Set of collapsed region names
 */
function loadCollapsedRegions(): Set<string> {
  try {
    const collapsed = localStorage.getItem(STORAGE_COLLAPSED_REGIONS);
    if (!collapsed) {
      return new Set<string>();
    }

    const parsed = JSON.parse(collapsed);
    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    return new Set<string>(parsed);
  } catch (error) {
    console.error('Error loading collapsed regions from local storage:', error);
    return new Set<string>();
  }
}

/**
 * Loads the exploration level from the local storage.
 * @returns The exploration level (1-7, default 1)
 */
function loadExplorationLevel(): number {
  try {
    const level = localStorage.getItem(STORAGE_EXPLORATION_LEVEL);
    if (!level) {
      return 1;
    }

    const parsed = parseInt(level, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 7) {
      return 1;
    }

    return parsed;
  } catch (error) {
    console.error('Error loading exploration level from local storage:', error);
    return 1;
  }
}

export function useResourcesStore() {
  const [nodes, setNodesState] = useState<ResourceNode[]>(loadNodes());
  const [serverRegion, setServerRegionState] =
    useState<ServerRegion>(loadServerRegion());
  const [selectedMap, setSelectedMapState] =
    useState<string>(loadSelectedMap());
  const [collapsedRegions, setCollapsedRegionsState] = useState<Set<string>>(
    loadCollapsedRegions(),
  );
  const [explorationLevel, setExplorationLevelState] = useState<number>(
    loadExplorationLevel(),
  );

  // Persist the nodes to the local storage.
  useEffect(() => {
    localStorage.setItem(STORAGE_NODES, JSON.stringify(nodes));
  }, [nodes]);

  // Persist the server region to the local storage.
  useEffect(() => {
    localStorage.setItem(STORAGE_SERVER, serverRegion);
  }, [serverRegion]);

  // Persist the selected map to the local storage.
  useEffect(() => {
    localStorage.setItem(STORAGE_MAP, selectedMap);
  }, [selectedMap]);

  // Persist the collapsed regions to the local storage.
  useEffect(() => {
    localStorage.setItem(
      STORAGE_COLLAPSED_REGIONS,
      JSON.stringify(Array.from(collapsedRegions)),
    );
  }, [collapsedRegions]);

  // Persist the exploration level to the local storage.
  useEffect(() => {
    localStorage.setItem(
      STORAGE_EXPLORATION_LEVEL,
      explorationLevel.toString(),
    );
  }, [explorationLevel]);

  /**
   * Toggles the tracking of a node and persists it to the local storage.
   * Nodes are stored in an array of objects
   */
  const toggleNodeTracking = useCallback((nodeId: string) => {
    setNodesState((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId ? { ...node, tracked: !node.tracked } : node,
      ),
    );
  }, []);

  /**
   * Sets the server region and persists it to the local storage.
   */
  const setServerRegion = useCallback((region: ServerRegion) => {
    setServerRegionState(region);

    // Prevent accidental multi-increment when switching server regions.
    // Use the new region value, not the old one
    const currentKey = getMostRecentResetKey(new Date(), region);
    localStorage.setItem(STORAGE_LAST_RESET_KEY, currentKey);
  }, []);

  /**
   * Sets the selected map and persists it to the local storage.
   */
  const setSelectedMap = useCallback((map: string) => {
    setSelectedMapState(map);
  }, []);

  /**
   * Toggles the collapsed state of a region and persists it to the local storage.
   */
  const toggleRegionCollapsed = useCallback((region: string) => {
    setCollapsedRegionsState((prev) => {
      const next = new Set(prev);
      if (next.has(region)) {
        next.delete(region);
      } else {
        next.add(region);
      }
      return next;
    });
  }, []);

  /**
   * Checks if a region is collapsed.
   */
  const isRegionCollapsed = useCallback(
    (region: string): boolean => {
      return collapsedRegions.has(region);
    },
    [collapsedRegions],
  );

  /**
   * Sets the current number of a node and persists it to the local storage.
   */
  const setCurrentNodeNumber = useCallback((nodeId: string, number: number) => {
    setNodesState((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        // Verify the number is within the valid range.
        const clampedNumber = Math.max(0, Math.min(number, node.max));
        return { ...node, current: clampedNumber };
      }),
    );
  }, []);

  /**
   * Sets the maximum number of a node and persists it to the local storage.
   */
  const setMaxNodeNumber = useCallback((nodeId: string, max: number) => {
    setNodesState((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        // Verify the max is within the valid range.
        const clampedMax = Math.max(0, max);

        // Now that we allow an increased max, reflect that current number
        // can be incremented by 1.
        const nextCurrent = Math.min(node.current, clampedMax);
        return { ...node, max: clampedMax, current: nextCurrent };
      }),
    );
  }, []);

  /**
   * Clears the current number of a node and persists it to the local storage.
   */
  const clearCurrentNodeNumber = useCallback((nodeId: string) => {
    setNodesState((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }
        return { ...node, current: 0 };
      }),
    );
  }, []);

  /**
   * Applies the daily increment to the nodes and persists it to the local storage.
   */
  const applyDailyIncrement = useCallback(
    (days: number) => {
      if (days <= 0) return;

      // If exploration level is 7, increment by 2 per day instead of 1
      const incrementPerDay = explorationLevel === 7 ? 2 : 1;
      const totalIncrement = days * incrementPerDay;

      setNodesState((prevNodes) =>
        prevNodes.map((node) => {
          const nextCurrent = Math.min(node.current + totalIncrement, node.max);
          return nextCurrent === node.current
            ? node
            : { ...node, current: nextCurrent };
        }),
      );
    },
    [explorationLevel],
  );

  // Daily reset checker (runs on mount and every second)
  // Runs every second so that when the countdown reaches 0, nodes update in real time
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const currentKey = getMostRecentResetKey(now, serverRegion);

      const lastKey = localStorage.getItem(STORAGE_LAST_RESET_KEY);
      // If no last key, set the current key and return.
      if (!lastKey) {
        localStorage.setItem(STORAGE_LAST_RESET_KEY, currentKey);
        return;
      }

      // Calculate the number of days passed since the last reset.
      const daysPassed = diffDaysKeys(lastKey, currentKey);
      if (daysPassed > 0) {
        applyDailyIncrement(daysPassed);
        localStorage.setItem(STORAGE_LAST_RESET_KEY, currentKey);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [serverRegion, applyDailyIncrement, explorationLevel]);

  /**
   * Applies one daily increment for testing (e.g. to verify UI without waiting 24h).
   * Also updates the last reset key so the next real reset does not double-apply.
   */
  const runTestDailyIncrement = useCallback(() => {
    applyDailyIncrement(1);
    const currentKey = getMostRecentResetKey(new Date(), serverRegion);
    localStorage.setItem(STORAGE_LAST_RESET_KEY, currentKey);
  }, [serverRegion, applyDailyIncrement]);

  /**
   * Sets the exploration level and persists it to the local storage.
   */
  const setExplorationLevel = useCallback((level: number) => {
    const clampedLevel = Math.max(1, Math.min(7, level));
    setExplorationLevelState(clampedLevel);
  }, []);

  return {
    nodes,
    serverRegion,
    setServerRegion,
    selectedMap,
    setSelectedMap,
    toggleNodeTracking,
    setCurrentNodeNumber,
    setMaxNodeNumber,
    clearCurrentNodeNumber,
    toggleRegionCollapsed,
    isRegionCollapsed,
    explorationLevel,
    setExplorationLevel,
    runTestDailyIncrement,
  };
}
