import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { REGION_DICT } from '../../../../../shared/data/interactive-map/map';
import {
  getFilteredMarkersForRegion,
  MARKER_TYPE_DICT,
} from '../../../../../shared/data/interactive-map/marker';
import {
  getRemoteTileResourceUrl,
  getMarkerIconUrl,
} from '../../Map/utils/resource';
import { ResourceNode } from '../types/resources.types';
import {
  resourceNameToMarkerType,
  mapNameToRegionId,
  regionNameToSubregionId,
  clusterMarkersByDistance,
  getNodeIndexInRegion,
} from '../../../../../shared/utils/resourceMapping';

// Category color helper (matches markerLayer.ts)
const CATEGORY_COLORS: Record<string, string> = {
  collection: '#4CAF50',
  natural: '#8BC34A',
  valuable: '#FFC107',
  combat: '#F44336',
  npc: '#2196F3',
  facility: '#9C27B0',
  mob: '#FF5722',
  boss: '#E91E63',
};

function getCategoryColor(category?: string): string {
  return CATEGORY_COLORS[category || ''] || '#666666';
}

interface MapLocationModalProps {
  isOpen: boolean;
  node: ResourceNode | null;
  onClose: () => void;
  containerRef?: React.RefObject<HTMLElement>;
}

const MapLocationModal: React.FC<MapLocationModalProps> = ({
  isOpen,
  node,
  onClose,
  containerRef,
}) => {
  const [overlayStyle, setOverlayStyle] = useState<React.CSSProperties>({});
  const overlayRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Position the overlay to match the container
  useEffect(() => {
    if (isOpen && containerRef?.current) {
      const updatePosition = () => {
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          setOverlayStyle({
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
          });
        }
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen, containerRef]);

  // Initialize Leaflet map when modal opens
  useEffect(() => {
    if (!isOpen || !node || !mapContainerRef.current) return;

    const regionId = mapNameToRegionId(node.map);
    const markerType = resourceNameToMarkerType(node.name);
    if (!regionId) return;

    const config = REGION_DICT[regionId];
    if (!config) return;

    // Small delay to let DOM render before initializing the map
    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const maxNativeZoom = config.maxZoom;
      const maxZoom = maxNativeZoom + 1;

      const map = L.map(mapContainerRef.current, {
        crs: L.CRS.Simple,
        minZoom: 0,
        maxZoom,
        zoomControl: false,
        attributionControl: false,
        zoomSnap: 0.25,
        zoomDelta: 0.25,
        wheelPxPerZoomLevel: 50,
      });

      // Set map bounds
      const southWest = map.unproject([0, config.dimensions[1]], maxNativeZoom);
      const northEast = map.unproject([config.dimensions[0], 0], maxNativeZoom);
      const mapBounds = L.latLngBounds(southWest, northEast);
      map.setMaxBounds(mapBounds);

      // Add tile layer
      L.tileLayer(getRemoteTileResourceUrl(regionId), {
        tileSize: config.tileSize,
        noWrap: true,
        bounds: mapBounds,
        pane: 'tilePane',
        maxNativeZoom,
        maxZoom,
        errorTileUrl:
          'data:image/webp;base64,UklGRhYAAABXRUJQVlA4TAoAAAAvAAAAAP8B/wE=',
      }).addTo(map);

      // Find matching markers and add them to the map
      if (markerType) {
        // Get all markers of this type in the region
        const allMarkers = getFilteredMarkersForRegion(regionId, [markerType]);
        const markerTypeInfo = MARKER_TYPE_DICT[markerType];
        const categoryColor = getCategoryColor(markerTypeInfo?.category?.sub);
        const iconUrl = getMarkerIconUrl(markerType);

        // Narrow down to the specific subregion
        const subregionId = regionNameToSubregionId(node.region);
        const subregionMarkers = subregionId
          ? allMarkers.filter((m) => m.subregionId === subregionId)
          : allMarkers;

        // Cluster nearby markers and find this node's cluster
        const clusters = clusterMarkersByDistance(subregionMarkers);
        const nodeIndex = getNodeIndexInRegion(node.id, node.name, node.region);
        const targetCluster =
          clusters.length > 0
            ? clusters[Math.min(nodeIndex, clusters.length - 1)]
            : subregionMarkers;

        // Add all subregion markers (dimmed if not in target cluster)
        const targetIds = new Set(targetCluster.map((m) => m.id));
        const focusLatLngs: L.LatLng[] = [];

        subregionMarkers.forEach((markerData) => {
          const latLng = L.latLng(
            markerData.position[0],
            markerData.position[1],
          );
          const isFocused = targetIds.has(markerData.id);

          if (isFocused) focusLatLngs.push(latLng);

          const icon = L.divIcon({
            className: `map-marker mini-map-marker${isFocused ? '' : ' dimmed'}`,
            html: `
              <div class="map-marker-icon" style="border-color: ${categoryColor}; box-shadow: 0 0 8px ${categoryColor}80; ${!isFocused ? 'opacity: 0.3;' : ''}">
                <img src="${iconUrl}" alt="${markerType}" 
                     onerror="this.onerror=null; this.src='../items-img/map/default.png';" />
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          L.marker(latLng, { icon }).addTo(map);
        });

        // Zoom to the target cluster
        if (focusLatLngs.length > 0) {
          const bounds = L.latLngBounds(focusLatLngs);
          map.fitBounds(bounds, {
            padding: [80, 80],
            maxZoom: 5,
            animate: false,
          });
        }
      } else {
        // No matching marker type — show center of map
        const center = map.unproject(
          [
            config.dimensions[0] / 2 + config.initialOffset.x,
            config.dimensions[1] / 2 + config.initialOffset.y,
          ],
          maxNativeZoom,
        );
        map.setView(center, config.initialZoom, { animate: false });
      }

      mapInstanceRef.current = map;
    }, 50);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, node]);

  if (!isOpen || !node) return null;

  const markerType = resourceNameToMarkerType(node.name);
  const markerTypeInfo = markerType ? MARKER_TYPE_DICT[markerType] : null;
  const categoryColor = getCategoryColor(markerTypeInfo?.category?.sub);

  return (
    <div
      ref={overlayRef}
      className="map-location-modal-overlay"
      style={overlayStyle}
      onClick={onClose}
    >
      <div
        className="map-location-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="map-location-modal-header">
          <div className="map-location-modal-header-info">
            {markerType && (
              <div
                className="map-location-modal-icon"
                style={{ borderColor: categoryColor }}
              >
                <img
                  src={getMarkerIconUrl(markerType)}
                  alt={node.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <h3 className="map-location-modal-title">
              {node.name} — {node.region}
            </h3>
          </div>
          <button
            className="map-location-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="map-location-modal-body">
          <div ref={mapContainerRef} className="map-location-modal-map" />
        </div>
      </div>
    </div>
  );
};

export default MapLocationModal;
