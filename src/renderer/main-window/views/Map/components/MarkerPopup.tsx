import React from 'react';
import {
  IMarkerData,
  MARKER_TYPE_DICT,
} from '../../../../../shared/data/interactive-map/marker';
import { getLocalMarkerResourceUrl } from '../utils/resource';

interface MarkerPopupProps {
  marker: IMarkerData | null;
  isCollected: boolean;
  onToggleCollected: () => void;
  onClose: () => void;
}

// Category color mapping
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

const MarkerPopup: React.FC<MarkerPopupProps> = ({
  marker,
  isCollected,
  onToggleCollected,
  onClose,
}) => {
  if (!marker) return null;

  const markerType = MARKER_TYPE_DICT[marker.type];
  const typeName = markerType?.name || marker.type;
  const category = markerType?.category.sub || 'unknown';
  const categoryColor = CATEGORY_COLORS[category] || '#666';

  return (
    <div className="map-popup-overlay" onClick={onClose}>
      <div className="map-popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="map-popup-close" onClick={onClose}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="map-popup-icon-container">
          <div className="map-popup-icon-wrapper">
            <img
              src={getLocalMarkerResourceUrl(marker.type)}
              alt={typeName}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          {isCollected && (
            <div className="map-popup-collected-badge">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          )}
        </div>

        <div className="map-popup-content">
          <span
            className="map-popup-category-badge"
            style={{
              backgroundColor: `${categoryColor}20`,
              color: categoryColor,
              borderColor: `${categoryColor}40`,
            }}
          >
            {category}
          </span>
          <h3 className="map-popup-title">{typeName}</h3>
          <p className="map-popup-region">
            {marker.subregionId.replace(/_/g, ' ')}
          </p>
        </div>

        <div className="map-popup-actions">
          <button
            className={`map-popup-btn ${isCollected ? 'map-popup-btn-collected' : 'map-popup-btn-primary'}`}
            onClick={onToggleCollected}
          >
            {isCollected ? (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                Unmark
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Collected
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkerPopup;
