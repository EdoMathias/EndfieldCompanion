import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MarkerLayer as MarkerLayerClass } from '../utils/markerLayer';

interface MarkerLayerProps {
  map: L.Map | null;
  regionId: string;
  activeTypes: string[];
  collectedIds: string[];
  hideCollected: boolean;
  onToggleCollected: (markerId: string) => void;
}

const MarkerLayer: React.FC<MarkerLayerProps> = ({
  map,
  regionId,
  activeTypes,
  collectedIds,
  hideCollected,
  onToggleCollected,
}) => {
  const markerLayerRef = useRef<MarkerLayerClass | null>(null);

  // Initialize marker layer when map is ready
  useEffect(() => {
    if (!map) return;

    markerLayerRef.current = new MarkerLayerClass(map, {
      onToggleCollected,
    });

    // Set initial state before loading markers
    markerLayerRef.current.setActiveTypes(activeTypes);
    markerLayerRef.current.setCollectedIds(collectedIds);
    markerLayerRef.current.setHideCollected(hideCollected);

    // Load initial markers
    markerLayerRef.current.loadRegion(regionId);

    return () => {
      markerLayerRef.current?.clearMarkers();
      markerLayerRef.current = null;
    };
  }, [map]);

  // Load markers when region changes
  useEffect(() => {
    if (!markerLayerRef.current || !regionId) return;
    // Only reload if already initialized
    if (markerLayerRef.current.getCurrentRegion() !== regionId) {
      console.log('Loading markers for region:', regionId);
      markerLayerRef.current.loadRegion(regionId);
    } else {
      console.log('Region already loaded:', regionId);
    }
  }, [regionId]);

  // Update filters when activeTypes changes
  useEffect(() => {
    markerLayerRef.current?.setActiveTypes(activeTypes);
  }, [activeTypes]);

  // Update collected state
  useEffect(() => {
    markerLayerRef.current?.setCollectedIds(collectedIds);
  }, [collectedIds]);

  // Update hide collected
  useEffect(() => {
    markerLayerRef.current?.setHideCollected(hideCollected);
  }, [hideCollected]);

  // Update toggle callback when it changes (to handle React's changing function references)
  useEffect(() => {
    markerLayerRef.current?.updateToggleCallback(onToggleCollected);
  }, [onToggleCollected]);

  return null; // This component doesn't render anything
};

export default MarkerLayer;
