import React, { useMemo, useState } from 'react';
import {
  MARKER_TYPE_DICT,
  MARKER_TYPE_TREE,
  DEFAULT_SUBCATEGORY_ORDER,
  getMarkerCountsForRegion,
  getMarkerIdsForRegionAndType,
} from '../../../../../shared/data/interactive-map/marker';
import { getLocalMarkerResourceUrl } from '../utils/resource';

interface MapControlsProps {
  regionId: string;
  activeTypes: string[];
  hideCollected: boolean;
  collectedIds: string[];
  onToggleType: (typeKey: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onSetHideCollected: (hide: boolean) => void;
  onSelectCategory: (category: string) => void;
  onDeselectCategory: (category: string) => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  regionId,
  activeTypes,
  hideCollected,
  collectedIds,
  onToggleType,
  onSelectAll,
  onClearAll,
  onSetHideCollected,
  onSelectCategory,
  onDeselectCategory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['collection']),
  );

  const markerCounts = getMarkerCountsForRegion(regionId);
  const collectedSet = useMemo(() => new Set(collectedIds), [collectedIds]);

  // Get collected count for a type
  const getCollectedCountForType = (typeKey: string): number => {
    const markerIds = getMarkerIdsForRegionAndType(regionId, typeKey);
    return markerIds.filter((id) => collectedSet.has(id)).length;
  };

  // Get category stats
  const getCategoryStats = (
    category: string,
  ): { collected: number; total: number } => {
    const typesInCategory = MARKER_TYPE_TREE[category] || [];
    let collected = 0;
    let total = 0;
    for (const type of typesInCategory) {
      const count = markerCounts[type.key] || 0;
      if (count > 0) {
        total += count;
        collected += getCollectedCountForType(type.key);
      }
    }
    return { collected, total };
  };

  // Filter types by search query
  const filterBySearch = (types: { key: string; name: string }[]) => {
    if (!searchQuery.trim()) return types;
    const query = searchQuery.toLowerCase();
    return types.filter(
      (type) =>
        type.name.toLowerCase().includes(query) ||
        type.key.toLowerCase().includes(query),
    );
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const isTypeActive = (typeKey: string) => {
    return activeTypes.includes(typeKey);
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="map-controls">
        <button
          className={`map-control-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          title="Filter Markers"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
        </button>
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="map-filter-panel">
          <div className="map-filter-header">
            <h3 className="map-filter-title">Marker Filters</h3>
            <button
              className="map-filter-close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Search Bar */}
          <div className="map-filter-search">
            <svg
              className="map-filter-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="map-filter-search-input"
              placeholder="Search markers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="map-filter-search-clear"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Hide Collected Toggle */}
          <div
            className={`map-toggle-collected ${hideCollected ? 'active' : ''}`}
            onClick={() => onSetHideCollected(!hideCollected)}
          >
            <div className="map-filter-checkbox">
              {hideCollected && (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </div>
            <span className="map-toggle-collected-label">Hide Collected</span>
          </div>

          {/* Quick Actions */}
          <div className="map-filter-actions">
            <button className="map-filter-action-btn" onClick={onSelectAll}>
              Select All
            </button>
            <button className="map-filter-action-btn" onClick={onClearAll}>
              Clear All
            </button>
          </div>

          {/* Category Groups */}
          {DEFAULT_SUBCATEGORY_ORDER.map((category) => {
            const typesInCategory = MARKER_TYPE_TREE[category] || [];
            const filteredTypes = filterBySearch(typesInCategory);
            // Skip category if no types match search or all counts are 0
            const hasVisibleTypes = filteredTypes.some(
              (type) => (markerCounts[type.key] || 0) > 0,
            );
            if (!hasVisibleTypes) return null;

            const isExpanded = expandedCategories.has(category);
            const stats = getCategoryStats(category);

            return (
              <div key={category} className="map-filter-group">
                <div className="map-filter-group-header">
                  <div
                    className="map-filter-group-title"
                    onClick={() => toggleCategory(category)}
                  >
                    <span className="map-filter-expand-icon">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <span className="map-filter-group-name">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </span>
                    <span className="map-filter-progress">
                      {stats.collected}/{stats.total}
                    </span>
                  </div>
                  <div className="map-filter-group-actions">
                    <button
                      className="map-filter-group-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCategory(category);
                      }}
                      title="Select all in category"
                    >
                      ✓
                    </button>
                    <button
                      className="map-filter-group-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeselectCategory(category);
                      }}
                      title="Deselect all in category"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="map-filter-options">
                    {filteredTypes.map((type) => {
                      const count = markerCounts[type.key] || 0;
                      if (count === 0) return null;

                      const isActive = isTypeActive(type.key);
                      const collectedCount = getCollectedCountForType(type.key);

                      return (
                        <div
                          key={type.key}
                          className={`map-filter-option ${isActive ? 'active' : ''}`}
                          onClick={() => onToggleType(type.key)}
                        >
                          <div className="map-filter-checkbox">
                            {isActive && (
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            )}
                          </div>
                          <img
                            className="map-filter-item-icon"
                            src={getLocalMarkerResourceUrl(type.key)}
                            alt=""
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                'none';
                            }}
                          />
                          <span className="map-filter-label">
                            {type.name || type.key}
                          </span>
                          <span className="map-filter-count">
                            {collectedCount}/{count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default MapControls;
