import L from 'leaflet';
import { REGION_DICT } from '../../../../../shared/data/interactive-map/map';

/**
 * Convert marker position to Leaflet LatLng.
 *
 * Marker positions in the JSON files are already in Leaflet's LatLng
 * coordinate space (for CRS.Simple). We just need to wrap them as L.LatLng.
 *
 * For CRS.Simple with dimensions [8000, 8000] at maxZoom 3:
 * - Scale = 2^3 = 8
 * - LatLng bounds: lat [-1000, 0], lng [0, 1000]
 * - Marker positions like [-590, 333] fit within this space
 *
 * @param position - LatLng coordinates [lat, lng] (NOT pixels)
 * @param regionId - Region ID (unused, kept for API compatibility)
 * @param map - Leaflet map instance (unused, kept for API compatibility)
 * @returns Leaflet LatLng
 */
export function gameToLatLng(
  position: [number, number],
  regionId: string,
  map: L.Map,
): L.LatLng {
  // Position is already in LatLng space - just wrap it
  return L.latLng(position[0], position[1]);
}

/**
 * Convert LatLng back to pixel coordinates.
 * Useful for click-to-place tools or debugging.
 *
 * @param latlng - Leaflet LatLng
 * @param regionId - Region ID
 * @param map - Leaflet map instance
 * @returns Pixel coordinates [x, y] at maxZoom or null
 */
export function latLngToPixel(
  latlng: L.LatLng,
  regionId: string,
  map: L.Map,
): [number, number] | null {
  const region = REGION_DICT[regionId];
  if (!region) return null;

  const point = map.project(latlng, region.maxZoom);
  return [point.x, point.y];
}
