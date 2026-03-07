import { REGION_DICT } from '../../../../../shared/data/interactive-map/map';
import L from 'leaflet';
import { IMapView, LayerType, IMapCoreOptions } from '../types/map.types';
import { getLocalTileResourceUrl, getRemoteTileResourceUrl } from './resource';

// Helper to convert layer type to tile suffix
const getLayerTileSuffix = (layer: LayerType): string => {
  if (layer === 'M') return '';
  return `_${layer.toLowerCase()}`;
};

export class MapCore {
  map!: L.Map;

  currentRegionId!: string;
  private mainTileLayer?: L.TileLayer;
  private layerTileLayer?: L.TileLayer;
  private currentLayer: LayerType = 'M';
  private options?: IMapCoreOptions;

  // TODO: add boundary manager
  // TODO: add marker layer

  private transforming = false;

  constructor(ele: HTMLDivElement, options?: IMapCoreOptions) {
    this.options = options;
    this.map = L.map(ele, {
      crs: L.CRS.Simple,
      minZoom: 0,
      maxZoom: 3,
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0.25,
      zoomDelta: 0.25,
      wheelPxPerZoomLevel: 50,
      wheelDebounceTime: 0,
    });

    this.map.on('moveend', () => {
      if (!this.transforming) {
        options?.saveViewState(this.currentRegionId, {
          lat: this.map.getCenter().lat,
          lng: this.map.getCenter().lng,
          zoom: this.map.getZoom(),
        });
      }
    });

    this.map.on('zoomend', () => {
      if (!this.transforming) {
        options?.saveViewState(this.currentRegionId, {
          lat: this.map.getCenter().lat,
          lng: this.map.getCenter().lng,
          zoom: this.map.getZoom(),
        });
      }
    });
  }

  async switchRegion(regionId: string): Promise<void> {
    this.currentRegionId = regionId;

    // this.boundaryManager.hideBoundaries();

    this.map.eachLayer((layer) => this.map.removeLayer(layer));

    const config = REGION_DICT[regionId];

    // fallback for missing region config
    if (!config) {
      throw new Error(`Region config not found for: ${regionId}`);
    }

    if (config.maxZoom === undefined) {
      throw new Error(
        `Invalid region config for: ${regionId}. Missing maxZoom.`,
      );
    }

    // Keep Leaflet's zoom constraints in sync with region config.
    // Otherwise users can zoom beyond available tiles (blank map).
    const maxNativeZoom = config.maxZoom;
    const maxZoom = maxNativeZoom + 1;
    this.map.setMaxZoom(maxZoom);

    const view = this.options?.getViewState(regionId);
    if (
      view &&
      view.lat !== undefined &&
      view.lng !== undefined &&
      view.zoom !== undefined
    ) {
      const clampedZoom = Math.min(view.zoom, maxZoom);
      this.map.setView([view.lat, view.lng], clampedZoom, {
        animate: false,
      });
    } else {
      if (
        !config.dimensions ||
        !config.initialOffset ||
        config.maxZoom === undefined ||
        config.initialZoom === undefined
      ) {
        throw new Error(
          `Invalid region config for: ${regionId}. Missing required properties. Config: ${JSON.stringify(config)}`,
        );
      }
      const center = this.map.unproject(
        [
          config.dimensions[0] / 2 + config.initialOffset.x,
          config.dimensions[1] / 2 + config.initialOffset.y,
        ],
        config.maxZoom,
      );
      if (!center || center.lat === undefined || center.lng === undefined) {
        throw new Error(
          `Invalid center coordinates for region: ${regionId}. Center: ${JSON.stringify(center)}`,
        );
      }
      const clampedZoom = Math.min(config.initialZoom, maxZoom);
      this.map.setView([center.lat, center.lng], clampedZoom, {
        animate: false,
      });
    }

    const southWest = this.map.unproject(
      [0, config.dimensions[1]],
      config.maxZoom,
    );
    const northEast = this.map.unproject(
      [config.dimensions[0], 0],
      config.maxZoom,
    );

    const mapBounds = L.latLngBounds(southWest, northEast);

    // set map bounds to restrict panning
    this.map.setMaxBounds(mapBounds);

    const tileLayer = L.tileLayer(
      // getLocalTileResourceUrl(regionId),
      getRemoteTileResourceUrl(regionId),
      {
        tileSize: config.tileSize,
        noWrap: true,
        bounds: mapBounds,
        pane: 'tilePane',
        maxNativeZoom: config.maxZoom,
        maxZoom: maxZoom,
        // Use 1x1 transparent webp to suppress 404 console errors for missing tiles
        errorTileUrl:
          'data:image/webp;base64,UklGRhYAAABXRUJQVlA4TAoAAAAvAAAAAP8B/wE=',
      },
    ).addTo(this.map);

    // Store main tile layer reference
    this.mainTileLayer = tileLayer;
    this.layerTileLayer = undefined;
    this.currentLayer = 'M';

    // Resolve when base tiles finish initial load to signal readiness
    await new Promise<void>((resolve) => {
      // If the layer is already loaded (from cache), resolve on next tick
      let resolved = false;
      const done = () => {
        if (resolved) return;
        resolved = true;
        tileLayer.off('load', done);
        resolve();
      };
      tileLayer.once('load', done);
      // Fallback: if no tiles are needed, Leaflet may not fire 'load';
      // use a microtask to resolve quickly without arbitrary timeout
      void Promise.resolve().then(done);
    });
  }

  setMapView(view: IMapView) {
    if (this.transforming) return;
    this.transforming = true;
    const onEnd = () => {
      this.transforming = false;
      this.map.off('moveend', onEnd);
      this.map.off('zoomend', onEnd);
    };
    this.map.on('moveend', onEnd);
    this.map.on('zoomend', onEnd);
    this.map.setView([view.lat, view.lng], view.zoom);
  }

  // showSubregionBoundaries() {
  //     this.boundaryManager.showBoundaries(this.currentRegionId);
  // }

  // hideSubregionBoundaries() {
  //     this.boundaryManager.hideBoundaries();
  // }

  // enableMarkerClustering() {
  //     this.markerLayer.enableClustering();
  // }

  // disableMarkerClustering() {
  //     this.markerLayer.disableClustering();
  // }

  async switchLayer(layer: LayerType): Promise<void> {
    if (this.currentLayer === layer) return;

    const config = REGION_DICT[this.currentRegionId];
    if (!config) return;

    // Remove existing layer tile layer if any
    if (this.layerTileLayer) {
      this.map.removeLayer(this.layerTileLayer);
      this.layerTileLayer = undefined;
    }

    // Update main tile layer visual
    if (this.mainTileLayer) {
      const container = this.mainTileLayer.getContainer();
      if (layer === 'M') {
        if (container) {
          container.style.filter = 'brightness(1)';
        }
      } else {
        if (container) {
          container.style.filter = 'brightness(0.5)';
        }

        // Add layer tile layer
        const suffix = getLayerTileSuffix(layer);
        const southWest = this.map.unproject(
          [0, config.dimensions[1]],
          config.maxZoom,
        );
        const northEast = this.map.unproject(
          [config.dimensions[0], 0],
          config.maxZoom,
        );
        const mapBounds = L.latLngBounds(southWest, northEast);
        const maxZoom = config.maxZoom + 1;

        this.layerTileLayer = L.tileLayer(
          // getLocalTileResourceUrl(this.currentRegionId),
          getRemoteTileResourceUrl(this.currentRegionId),
          {
            tileSize: config.tileSize,
            noWrap: true,
            bounds: mapBounds,
            pane: 'tilePane',
            maxNativeZoom: config.maxZoom,
            maxZoom: maxZoom,
            // Use 1x1 transparent webp to suppress 404 console errors for missing tiles
            errorTileUrl:
              'data:image/webp;base64,UklGRhYAAABXRUJQVlA4TAoAAAAvAAAAAP8B/wE=',
          },
        ).addTo(this.map);

        // Wait for layer tiles to load
        await new Promise<void>((resolve) => {
          let resolved = false;
          const done = () => {
            if (resolved) return;
            resolved = true;
            this.layerTileLayer?.off('load', done);
            resolve();
          };
          this.layerTileLayer?.once('load', done);
          void Promise.resolve().then(done);
        });
      }
    }

    this.currentLayer = layer;
    // this.map.fire('talos:layerSwitched', { layer });
  }
}
