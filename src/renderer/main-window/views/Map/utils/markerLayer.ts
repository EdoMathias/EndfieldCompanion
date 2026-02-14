import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import {
  getMarkersForRegion,
  IMarkerData,
  MARKER_TYPE_DICT,
} from '../../../../../shared/data/interactive-map/marker';
import { gameToLatLng } from './coordinates';
import { getLocalMarkerResourceUrl } from './resource';

// Category colors for cluster styling
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

// Only these categories will be clustered; all others show individual markers
const CLUSTERABLE_CATEGORIES = new Set(['natural', 'valuable', 'mob']);

export interface MarkerLayerOptions {
  onToggleCollected: (markerId: string) => void;
}

export class MarkerLayer {
  private map: L.Map;
  // One cluster group per marker type for type-specific clustering
  private clusterGroups: Map<string, L.MarkerClusterGroup> = new Map();
  // Layer group for unclustered markers
  private unclusteredLayer: L.LayerGroup = L.layerGroup();
  private markers: Map<string, L.Marker> = new Map();
  private markerTypeMap: Map<string, string> = new Map(); // markerId -> type
  private currentRegion: string = '';
  private activeTypes: Set<string> = new Set();
  private collectedIds: Set<string> = new Set();
  private hideCollected: boolean = false;
  private options: MarkerLayerOptions;

  constructor(map: L.Map, options: MarkerLayerOptions) {
    this.map = map;
    this.options = options;
  }

  // Update the onToggleCollected callback (for handling React's changing function references)
  updateToggleCallback(callback: (markerId: string) => void): void {
    this.options.onToggleCollected = callback;
  }

  private shouldCluster(type: string): boolean {
    const markerType = MARKER_TYPE_DICT[type];
    const category = markerType?.category?.sub || 'unknown';
    return CLUSTERABLE_CATEGORIES.has(category);
  }

  private getOrCreateClusterGroup(type: string): L.MarkerClusterGroup {
    if (this.clusterGroups.has(type)) {
      return this.clusterGroups.get(type)!;
    }

    const markerType = MARKER_TYPE_DICT[type];
    const category = markerType?.category?.sub || 'unknown';
    const categoryColor = CATEGORY_COLORS[category] || '#666666';
    const iconUrl = getLocalMarkerResourceUrl(type);
    const typeName = markerType?.name || type;

    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 4,
      chunkedLoading: true,
      chunkInterval: 100,
      chunkDelay: 50,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          className: 'marker-cluster-typed',
          html: `
            <div class="marker-cluster-inner" style="border-color: ${categoryColor}; box-shadow: 0 0 12px ${categoryColor}40;">
              <img src="${iconUrl}" alt="${typeName}" class="marker-cluster-icon" 
                   onerror="this.onerror=null; this.src='../items-img/map/default.png';" />
              <span class="marker-cluster-count" style="background-color: ${categoryColor};">${count}</span>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });
      },
    });

    clusterGroup.addTo(this.map);
    this.clusterGroups.set(type, clusterGroup);
    return clusterGroup;
  }

  public loadRegion(regionId: string) {
    this.currentRegion = regionId;
    this.clearMarkers();

    const markers = getMarkersForRegion(regionId);
    console.log(
      '[MarkerLayer] - Markers loaded for region:',
      regionId,
      markers.length,
    );

    // Group markers by type for efficient batch adding
    const markersByType: Map<string, L.Marker[]> = new Map();

    markers.forEach((markerData) => {
      const marker = this.createMarker(markerData);
      if (marker) {
        if (!markersByType.has(markerData.type)) {
          markersByType.set(markerData.type, []);
        }
        markersByType.get(markerData.type)!.push(marker);
        this.markerTypeMap.set(markerData.id, markerData.type);
      }
    });

    // Add unclustered layer to map
    this.unclusteredLayer.addTo(this.map);

    // Add markers to cluster groups or unclustered layer based on category
    markersByType.forEach((typeMarkers, type) => {
      if (this.shouldCluster(type)) {
        const clusterGroup = this.getOrCreateClusterGroup(type);
        clusterGroup.addLayers(typeMarkers);
      } else {
        typeMarkers.forEach((marker) => this.unclusteredLayer.addLayer(marker));
      }
    });

    this.applyFilters();
  }

  public clearMarkers(): void {
    this.clusterGroups.forEach((group) => {
      group.clearLayers();
      this.map.removeLayer(group);
    });
    this.clusterGroups.clear();
    this.unclusteredLayer.clearLayers();
    this.map.removeLayer(this.unclusteredLayer);
    this.markers.clear();
    this.markerTypeMap.clear();
  }

  public setActiveTypes(types: string[]): void {
    this.activeTypes = new Set(types);
    this.applyFilters();
  }

  public setCollectedIds(ids: string[]): void {
    this.collectedIds = new Set(ids);
    this.updateCollectedStyles();
    if (this.hideCollected) {
      this.applyFilters();
    }
  }

  public setHideCollected(hide: boolean): void {
    this.hideCollected = hide;
    this.applyFilters();
  }

  public getMarker(id: string): L.Marker | undefined {
    return this.markers.get(id);
  }

  public focusMarker(id: string): void {
    const marker = this.getMarker(id);
    if (marker) {
      this.map.setView(marker.getLatLng(), this.map.getZoom());
      marker.openTooltip();
    }
  }

  public getMarkerCount(): number {
    return this.markers.size;
  }

  public getVisibleMarkerCount(): number {
    let count = 0;
    this.clusterGroups.forEach((group) => {
      count += group.getLayers().length;
    });
    count += this.unclusteredLayer.getLayers().length;
    return count;
  }

  public getCurrentRegion(): string {
    return this.currentRegion;
  }

  private createMarker(markerData: IMarkerData): L.Marker | null {
    const latLng = gameToLatLng(
      markerData.position,
      this.currentRegion,
      this.map,
    );
    if (!latLng) return null;

    const markerType = MARKER_TYPE_DICT[markerData.type];
    const isCollected = this.collectedIds.has(markerData.id);

    const icon = this.createMarkerIcon(
      markerData.type,
      isCollected,
      markerType?.noFrame,
    );

    const marker = L.marker(latLng, {
      icon,
      // @ts-ignore - custom property
      markerData,
    });

    // Bind popup with placeholder content (will be updated on open)
    marker.bindPopup('', {
      className: 'map-marker-popup',
      offset: [0, -8],
      closeButton: false,
      autoPan: true,
      autoPanPadding: [50, 50],
    });

    // Handle popup open to regenerate content with current collected state
    marker.on('popupopen', () => {
      const content = this.createPopupContent(markerData);
      marker.setPopupContent(content);
      requestAnimationFrame(() => {
        this.attachPopupEventListeners(markerData);
      });
    });

    const typeName = markerType?.name || markerData.type;
    marker.bindTooltip(typeName, {
      direction: 'top',
      offset: [0, -16],
      className: 'map-marker-tooltip',
    });

    this.markers.set(markerData.id, marker);
    return marker;
  }

  private createMarkerIcon(
    type: string,
    isCollected: boolean,
    noFrame?: boolean,
  ): L.DivIcon {
    const iconUrl = getLocalMarkerResourceUrl(type);
    const collectedClass = isCollected ? 'collected' : '';
    const frameClass = noFrame ? 'no-frame' : '';

    return L.divIcon({
      className: `map-marker ${collectedClass} ${frameClass}`,
      html: `
                <div class="map-marker-icon">
                    <img src="${iconUrl}" alt="${type}" 
                         onerror="this.onerror=null; this.src='../items-img/map/default.png';" />
                </div>
            `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }

  private applyFilters(): void {
    this.markers.forEach((marker, id) => {
      // @ts-ignore
      const markerData: IMarkerData = marker.options.markerData;
      const type = markerData.type;
      const typeVisible = this.activeTypes.has(type);
      const isCollected = this.collectedIds.has(id);
      const collectedVisible = !this.hideCollected || !isCollected;
      const shouldShow = typeVisible && collectedVisible;

      if (this.shouldCluster(type)) {
        const clusterGroup = this.clusterGroups.get(type);
        if (!clusterGroup) return;
        if (shouldShow) {
          if (!clusterGroup.hasLayer(marker)) clusterGroup.addLayer(marker);
        } else {
          if (clusterGroup.hasLayer(marker)) clusterGroup.removeLayer(marker);
        }
      } else {
        if (shouldShow) {
          if (!this.unclusteredLayer.hasLayer(marker))
            this.unclusteredLayer.addLayer(marker);
        } else {
          if (this.unclusteredLayer.hasLayer(marker))
            this.unclusteredLayer.removeLayer(marker);
        }
      }
    });
  }

  private updateCollectedStyles(): void {
    this.markers.forEach((marker, id) => {
      // @ts-ignore
      const markerData: IMarkerData = marker.options.markerData;
      const markerType = MARKER_TYPE_DICT[markerData.type];
      const isCollected = this.collectedIds.has(id);

      const icon = this.createMarkerIcon(
        markerData.type,
        isCollected,
        markerType?.noFrame,
      );
      marker.setIcon(icon);

      // Update popup content if open
      if (marker.isPopupOpen()) {
        const popup = marker.getPopup();
        if (popup) {
          const newContent = this.createPopupContent(markerData);
          popup.setContent(newContent);
          // Re-attach after DOM update
          requestAnimationFrame(() => {
            this.attachPopupEventListeners(markerData);
          });
        }
      }
    });
  }

  private createPopupContent(markerData: IMarkerData): string {
    const markerType = MARKER_TYPE_DICT[markerData.type];
    const typeName = markerType?.name || markerData.type;
    const category = markerType?.category?.sub || 'unknown';
    const categoryColor = CATEGORY_COLORS[category] || '#666666';
    const isCollected = this.collectedIds.has(markerData.id);
    const iconUrl = getLocalMarkerResourceUrl(markerData.type);

    return `
      <div class="map-popup-tooltip">
        <div class="map-popup-tooltip-header">
          <div class="map-popup-tooltip-icon" style="border-color: ${categoryColor};">
            <img src="${iconUrl}" alt="${typeName}" 
                 onerror="this.onerror=null; this.style.display='none';" />
          </div>
          <div class="map-popup-tooltip-info">
            <span class="map-popup-tooltip-category" style="color: ${categoryColor};">${category}</span>
            <h4 class="map-popup-tooltip-title">${typeName}</h4>
            <span class="map-popup-tooltip-region">${markerData.subregionId.replace(/_/g, ' ')}</span>
          </div>
        </div>
        <button class="map-popup-tooltip-btn ${isCollected ? 'collected' : ''}" data-marker-id="${markerData.id}">
          ${
            isCollected
              ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            Unmark`
              : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Collected`
          }
        </button>
      </div>
    `;
  }

  private attachPopupEventListeners(markerData: IMarkerData): void {
    const btn = document.querySelector(
      `[data-marker-id="${markerData.id}"]`,
    ) as HTMLButtonElement;
    if (btn && !btn.dataset.listenerAttached) {
      btn.dataset.listenerAttached = 'true';
      btn.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.options.onToggleCollected(markerData.id);
      };
    }
  }
}
