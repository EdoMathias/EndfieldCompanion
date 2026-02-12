import { useCallback, useRef, useEffect } from 'react';
import { IMapView } from '../types/map.types';

const STORAGE_PREFIX = 'endfield.map.viewState.';

export function useMapStore() {
    const cache = useRef<Record<string, IMapView>>({});

    // Load on mount
    useEffect(() => {
        const regions = ['valley-iv', 'wuling', 'dijiang'];
        regions.forEach(regionId => {
            try {
                const saved = localStorage.getItem(STORAGE_PREFIX + regionId);
                if (saved) {
                    cache.current[regionId] = JSON.parse(saved);
                }
            } catch (e) {
                // Ignore
            }
        });
    }, []);

    const getViewState = useCallback((regionId: string): IMapView | undefined => {
        return cache.current[regionId];
    }, []);

    const saveViewState = useCallback((regionId: string, view: IMapView) => {
        cache.current[regionId] = view;
        localStorage.setItem(STORAGE_PREFIX + regionId, JSON.stringify(view));
    }, []);

    return { getViewState, saveViewState };
}