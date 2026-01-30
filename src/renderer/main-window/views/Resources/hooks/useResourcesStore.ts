import { useCallback, useEffect, useState } from "react";
import { ResourceNode, ServerRegion } from "../types/resources.types";
import { diffDaysKeys, getMostRecentResetKey } from "../utils/resetTime";

/**
 * Local storage keys for the resources store.
 */
const STORAGE_NODES = 'endfield.resources.nodes.v1';

/**
 * Local storage key for the server region.
 */
const STORAGE_SERVER = 'endfield.resources.server.v1';

/**
 * Local storage key for the last applied reset key.
 * Will help to determine how many items to increment by when the app launches.
 */
const STORAGE_LAST_RESET_KEY = 'endfield.resources.lastAppliedResetKey.v1';

/**
 * Loads the nodes from the local storage.
 * @returns The nodes
 */
function loadNodes(): ResourceNode[] {
    const nodes = localStorage.getItem(STORAGE_NODES);
    if (!nodes) return [];
    try {
        const parsedNodes = JSON.parse(nodes);
        return Array.isArray(parsedNodes) ? parsedNodes : [];
    } catch (error) {
        console.error('Error parsing nodes from local storage:', error);
        return [];
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

export function useResourcesStore() {
    const [nodes, setNodesState] = useState<ResourceNode[]>(loadNodes());
    const [serverRegion, setServerRegionState] = useState<ServerRegion>(loadServerRegion());

    // Persist the nodes to the local storage.
    useEffect(() => {
        localStorage.setItem(STORAGE_NODES, JSON.stringify(nodes));
    }, [nodes]);

    // Persist the server region to the local storage.
    useEffect(() => {
        localStorage.setItem(STORAGE_SERVER, serverRegion);
    }, [serverRegion]);


    /**
     * Sets the server region and persists it to the local storage.
     */
    const setServerRegion = useCallback((region: ServerRegion) => {
        setServerRegionState(region);

        // Prevent accidental multi-increment when switching server regions.
        const currentKey = getMostRecentResetKey(new Date(), serverRegion);
        localStorage.setItem(STORAGE_LAST_RESET_KEY, currentKey);
    }, [serverRegion]);


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

    // Daily reset checker (runs on mount and every second)
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
    }, [serverRegion, applyDailyIncrement]);

    return {
        nodes,
        serverRegion,
        setServerRegion,
        setCurrentNodeNumber,
        setMaxNodeNumber,
        clearCurrentNodeNumber,
    };
}