import markerTypeDict from './type.json';
import { REGION_DICT } from '../map';
import DJ_1 from './data/DJ_1.json';
import WL_1 from './data/WL_1.json';
import WL_2 from './data/WL_2.json';
import VL_1 from './data/VL_1.json';
import VL_2 from './data/VL_2.json';
import VL_3 from './data/VL_3.json';
import VL_5 from './data/VL_5.json';
import VL_6 from './data/VL_6.json';
import VL_7 from './data/VL_7.json';

/**
 * Marker data interface
 */
export interface IMarkerData {
  id: string;
  position: [number, number];
  subregionId: string;
  type: string;
}

/**
 * Marker type interface
 */
export interface IMarkerType {
  key: string;
  name: string;
  noFrame?: boolean;
  subIcon?: string;
  category: {
    main: string;
    sub: string;
  };
}

/**
 * Subregion to marker data mapping
 */
export const SUBREGION_MARKS_MAP = {
  DJ_1: DJ_1 as IMarkerData[],
  VL_1: VL_1 as IMarkerData[],
  VL_2: VL_2 as IMarkerData[],
  VL_3: VL_3 as IMarkerData[],
  VL_5: VL_5 as IMarkerData[],
  VL_6: VL_6 as IMarkerData[],
  VL_7: VL_7 as IMarkerData[],
  WL_1: WL_1 as IMarkerData[],
  WL_2: WL_2 as IMarkerData[],
};

/**
 * World markers
 */
export const WORLD_MARKS = Object.values(SUBREGION_MARKS_MAP).reduce(
  (acc, subregion) => {
    acc.push(...subregion);
    return acc;
  },
  [],
);

export const MARKER_TYPE_DICT = markerTypeDict as Record<string, IMarkerType>;

/**
 * Region ID to subregion prefix mapping
 */
const REGION_TO_SUBREGION_PREFIX: Record<string, string> = {
  'valley-iv': 'VL',
  wuling: 'WL',
  dijiang: 'DJ',
};

/**
 * Get all markers for a region by aggregating its subregions.
 *
 * @param regionId - Region ID (e.g., 'valley-iv')
 * @returns Array of markers for that region
 */
export function getMarkersForRegion(regionId: string): IMarkerData[] {
  const region = REGION_DICT[regionId];
  if (!region) return [];

  const subregionIds = region.subregions || [];

  return subregionIds.reduce((acc, subregionId) => {
    acc.push(...(SUBREGION_MARKS_MAP[subregionId] || []));
    return acc;
  }, [] as IMarkerData[]);
}

/**
 * Get markers for a region filtered by types.
 *
 * @param regionId - Region ID
 * @param types - Array of marker type keys to include (empty = all)
 * @returns Filtered array of markers
 */
export function getFilteredMarkersForRegion(
  regionId: string,
  types: string[] = [],
): IMarkerData[] {
  const markers = getMarkersForRegion(regionId);

  if (types.length === 0) return markers;

  const typeSet = new Set(types);
  return markers.filter((marker) => typeSet.has(marker.type));
}

/**
 * Get marker count by type for a region.
 *
 * @param regionId - Region ID
 * @returns Record of type -> count
 */
export function getMarkerCountsForRegion(
  regionId: string,
): Record<string, number> {
  const markers = getMarkersForRegion(regionId);

  return markers.reduce(
    (acc, marker) => {
      acc[marker.type] = (acc[marker.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

/**
 * Pre-calculate the number of each type in each subregion
 * Format: { subregionId: { type: count } }
 */
export const SUBREGION_TYPE_COUNT_MAP: Record<
  string,
  Record<string, number>
> = Object.entries(SUBREGION_MARKS_MAP).reduce(
  (acc, [subregionId, markers]) => {
    const typeCounts: Record<string, number> = {};
    markers.forEach((marker) => {
      typeCounts[marker.type] = (typeCounts[marker.type] || 0) + 1;
    });
    acc[subregionId] = typeCounts;
    return acc;
  },
  {} as Record<string, Record<string, number>>,
);

/**
 * Pre-calculate the number of each type in each region
 * Format: { regionKey: { type: count } }
 */
export const REGION_TYPE_COUNT_MAP: Record<
  string,
  Record<string, number>
> = Object.entries(REGION_DICT).reduce(
  (acc, [regionKey, regionConfig]) => {
    const typeCounts: Record<string, number> = {};
    const subregions = regionConfig.subregions ?? [];
    subregions.forEach((subregionId) => {
      const subregionTypeCounts = SUBREGION_TYPE_COUNT_MAP[subregionId] ?? {};
      Object.entries(subregionTypeCounts).forEach(([type, count]) => {
        typeCounts[type] = (typeCounts[type] || 0) + count;
      });
    });
    acc[regionKey] = typeCounts;
    return acc;
  },
  {} as Record<string, Record<string, number>>,
);

/**
 * Default subcategory order
 */
export const DEFAULT_SUBCATEGORY_ORDER = [
  'collection',
  'natural',
  'valuable',
  'combat',
  'npc',
  'facility',
  'mob',
  'boss',
] as const;

/**
 * Marker type tree
 */
export const MARKER_TYPE_TREE: Record<string, IMarkerType[]> = Object.values(
  MARKER_TYPE_DICT,
).reduce((acc: Record<string, IMarkerType[]>, type) => {
  const subCategory = type.category.sub;
  acc[subCategory] = acc[subCategory] || [];
  acc[subCategory].push(type);
  return acc;
}, {});

/**
 * Get all marker IDs for a specific region and type.
 *
 * @param regionId - Region ID
 * @param typeKey - Marker type key
 * @returns Array of marker IDs
 */
export function getMarkerIdsForRegionAndType(
  regionId: string,
  typeKey: string,
): string[] {
  const markers = getMarkersForRegion(regionId);
  return markers.filter((m) => m.type === typeKey).map((m) => m.id);
}
