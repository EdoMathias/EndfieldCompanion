import React, { useRef, useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapCore } from '../utils/mapCore';
import { DEFAULT_REGION } from '../../../../../shared/data/interactive-map/map';
import { IMapView } from '../types/map.types';

interface MapContainerProps {
    currentRegion?: string;
    onMapReady?: (map: L.Map) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
    currentRegion = DEFAULT_REGION,
    onMapReady
}) => {
    const mapElementRef = useRef<HTMLDivElement>(null);
    const mapCoreRef = useRef<MapCore | null>(null);
    const viewStateCache = useRef<Record<string, IMapView>>({});
    const [isReady, setIsReady] = useState(false);

    // Synchronous view state access for MapCore
    const getViewState = useCallback((regionId: string): IMapView | undefined => {
        return viewStateCache.current[regionId];
    }, []);

    // Save view state to cache (and persist to IndexedDB)
    const saveViewState = useCallback((regionId: string, view: IMapView) => {
        viewStateCache.current[regionId] = view;
        // Persist async - fire and forget
        localStorage.setItem(
            `map-view-state-${regionId}`,
            JSON.stringify(view)
        );
    }, []);

    // Load cached view states on mount
    useEffect(() => {
        // Load any previously saved view states from localStorage
        const regions = ['valley-iv', 'wuling', 'dijiang'];
        regions.forEach(regionId => {
            try {
                const saved = localStorage.getItem(`map-view-state-${regionId}`);
                if (saved) {
                    viewStateCache.current[regionId] = JSON.parse(saved);
                }
            } catch (e) {
                // Ignore parse errors
            }
        });
    }, []);

    // Initialize MapCore
    useEffect(() => {
        if (!mapElementRef.current || mapCoreRef.current) return;

        const mapCore = new MapCore(mapElementRef.current, {
            getViewState,
            saveViewState,
            onMarkerClick: (marker) => {
                console.log('Marker clicked:', marker);
                // TODO: Handle marker click
            },
        });

        mapCoreRef.current = mapCore;

        // Initial region load
        mapCore.switchRegion(currentRegion).then(() => {
            setIsReady(true);
            onMapReady?.(mapCore.map);
        });

        // Cleanup on unmount
        return () => {
            if (mapCoreRef.current) {
                mapCoreRef.current.map.remove();
                mapCoreRef.current = null;
            }
        };
    }, []);

    // Handle region changes
    useEffect(() => {
        if (!mapCoreRef.current || !isReady) return;
        if (mapCoreRef.current.currentRegionId === currentRegion) return;

        mapCoreRef.current.switchRegion(currentRegion);
    }, [currentRegion, isReady]);

    return (
        <div
            ref={mapElementRef}
            className="leaflet-map-container"
            style={{ width: '100%', height: '100%' }}
        />
    );
};

export default MapContainer;