import React, { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import MapContainer from './components/MapContainer';
import MarkerLayer from './components/MarkerLayer';
import MapControls from './components/MapControls';
import {
  DEFAULT_REGION,
  REGION_DICT,
} from '../../../../shared/data/interactive-map/map';
import { useMarkerStore } from './hooks/useMarkerStore';
import { useCollectionStore } from './hooks/useCollectionStore';
import { useFTUE } from '../../../contexts/FTUEContext';

const MapView: React.FC = () => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [currentRegion, setCurrentRegion] = useState(DEFAULT_REGION);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { markInteractiveMapSeen } = useFTUE();

  // Marker filter state
  const {
    activeTypes,
    hideCollected,
    toggleType,
    selectAll,
    clearAll,
    setHideCollected,
    selectCategory,
    deselectCategory,
  } = useMarkerStore();

  // Collection state
  const {
    toggleCollected,
    getCollectedIdsArray,
    exportToJson,
    importFromJson,
  } = useCollectionStore();

  const onMapReady = useCallback((mapInstance: L.Map) => {
    setMap(mapInstance);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    markInteractiveMapSeen();
  }, [markInteractiveMapSeen]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentRegion(e.target.value);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importFromJson(file);
      } catch (err) {
        console.error('Import failed:', err);
      }
      e.target.value = '';
    }
  };

  return (
    <section className="map-view">
      {/* Map Header */}
      <div className="map-header">
        <div className="map-header-row">
          <h2 className="map-header-title">Interactive Map</h2>
        </div>
        <div className="map-header-row">
          <label className="map-header-label">
            Region
            <select
              className="map-header-select"
              value={currentRegion}
              onChange={handleRegionChange}
            >
              {Object.keys(REGION_DICT).map((regionId) => (
                <option key={regionId} value={regionId}>
                  {regionId
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </label>
          <div className="map-header-actions">
            <button
              className="map-header-btn"
              onClick={exportToJson}
              title="Export collected markers"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="16"
                height="16"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              Export
            </button>
            <button
              className="map-header-btn"
              onClick={handleImportClick}
              title="Import collected markers"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="16"
                height="16"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="map-view-content">
        {/* Loading */}
        <div className={`map-loading ${!isLoading ? 'hidden' : ''}`}>
          <div className="map-loading-spinner" />
          <span className="map-loading-text">Loading Map...</span>
        </div>

        {/* Leaflet Map */}
        <MapContainer currentRegion={currentRegion} onMapReady={onMapReady} />

        {/* Marker Layer */}
        <MarkerLayer
          map={map}
          regionId={currentRegion}
          activeTypes={activeTypes}
          collectedIds={getCollectedIdsArray()}
          hideCollected={hideCollected}
          onToggleCollected={toggleCollected}
        />

        {/* Filter Controls */}
        <MapControls
          regionId={currentRegion}
          activeTypes={activeTypes}
          hideCollected={hideCollected}
          collectedIds={getCollectedIdsArray()}
          onToggleType={toggleType}
          onSelectAll={selectAll}
          onClearAll={clearAll}
          onSetHideCollected={setHideCollected}
          onSelectCategory={selectCategory}
          onDeselectCategory={deselectCategory}
        />
      </div>
    </section>
  );
};

export default MapView;
