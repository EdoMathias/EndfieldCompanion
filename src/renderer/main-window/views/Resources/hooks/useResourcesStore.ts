import { useCallback, useEffect, useState } from "react";
import { ResourceNode, ResourceType, ServerRegion } from "../types/resources.types";
import { diffDaysKeys, getMostRecentResetKey } from "../utils/resetTime";
import resources from "../../../../../shared/data/resources.json";

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


const DEFAULT_NODES: ResourceNode[] = resources.resources.map(resource => ({
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

        return parsedNodes as ResourceNode[];
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

    if (serverRegion === "ASIA_UTC8" || serverRegion === "AMER_EU_UTC_MINUS_5") {
        return serverRegion;
    }

    return "AMER_EU_UTC_MINUS_5";
}

/**
 * Loads the selected map from the local storage.
 * @returns The selected map
 */
function loadSelectedMap(): string {
    const map = localStorage.getItem(STORAGE_MAP);
    
    if (map === "Valley IV" || map === "Wuling") {
        return map;
    }

    return "Valley IV"; // Default to Valley IV
}

export function useResourcesStore() {
    const [nodes, setNodesState] = useState<ResourceNode[]>(loadNodes());
    const [serverRegion, setServerRegionState] = useState<ServerRegion>(loadServerRegion());
    const [selectedMap, setSelectedMapState] = useState<string>(loadSelectedMap());

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

    /**
     * Toggles the tracking of a node and persists it to the local storage.
     * Nodes are stored in an array of objects
     */
    const toggleNodeTracking = useCallback((nodeId: string) => {
        setNodesState(prevNodes =>
            prevNodes.map(node => (node.id === nodeId ? { ...node, tracked: !node.tracked } : node))
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
     * Sets the current number of a node and persists it to the local storage.
     */
    const setCurrentNodeNumber = useCallback((nodeId: string, number: number) => {
        setNodesState(prevNodes =>
            prevNodes.map(node => {
                if (node.id !== nodeId) {
                    return node;
                }

                // Verify the number is within the valid range.
                const clampedNumber = Math.max(0, Math.min(number, node.max));
                return { ...node, current: clampedNumber };
            }))
    }, []);

    /**
     * Sets the maximum number of a node and persists it to the local storage.
     */
    const setMaxNodeNumber = useCallback((nodeId: string, max: number) => {
        setNodesState(prevNodes =>
            prevNodes.map(node => {
                if (node.id !== nodeId) {
                    return node;
                }

                // Verify the max is within the valid range.
                const clampedMax = Math.max(0, max);

                // Now that we allow an increased max, reflect that current number
                // can be incremented by 1.
                const nextCurrent = Math.min(node.current, clampedMax);
                return { ...node, max: clampedMax, current: nextCurrent };
            }))
    }, []);

    /**
     * Clears the current number of a node and persists it to the local storage.
     */
    const clearCurrentNodeNumber = useCallback((nodeId: string) => {
        setNodesState(prevNodes =>
            prevNodes.map(node => {
                if (node.id !== nodeId) {
                    return node;
                }
                return { ...node, current: 0 };
            }))
    }, []);

    /**
     * Applies the daily increment to the nodes and persists it to the local storage.
     */
    const applyDailyIncrement = useCallback((days: number) => {
        if (days <= 0) return;

        setNodesState(prevNodes =>
            prevNodes.map(node => {
                const nextCurrent = Math.min(node.current + days, node.max);
                return nextCurrent === node.current ? node : { ...node, current: nextCurrent };
            }))
    }, []);

    // Daily reset checker (runs on mount and every minute)
    // Checking every minute is sufficient since resets happen daily at 04:00
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
        // Check every minute instead of every second for better performance
        const interval = setInterval(tick, 60_000);
        return () => clearInterval(interval);
    }, [serverRegion, applyDailyIncrement]);

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
    };
}