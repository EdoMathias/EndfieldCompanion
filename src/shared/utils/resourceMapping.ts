import { MARKER_TYPE_DICT, IMarkerData } from '../data/interactive-map/marker';
import resources from '../data/resources.json';

/**
 * Manual overrides for resource names that don't follow the
 * standard `lowercase_underscored + '_spot'` convention.
 */
const NAME_TO_TYPE_OVERRIDES: Record<string, string> = {
  Igeosite: 'igneosite_spot',
};

/**
 * Map name (from resources.json) → interactive map region ID.
 */
const MAP_NAME_TO_REGION_ID: Record<string, string> = {
  'Valley IV': 'valley-iv',
  Wuling: 'wuling',
  Dijiang: 'dijiang',
};

/**
 * Resource region name → interactive map subregion ID.
 */
const REGION_NAME_TO_SUBREGION_ID: Record<string, string> = {
  'The Hub': 'VL_1',
  'Valley Pass': 'VL_2',
  'Aburrey Quarry': 'VL_3',
  'Originium Science Park': 'VL_5',
  'Origin Lodespring': 'VL_6',
  'Power Plateau': 'VL_7',
  'Jingyu Valley': 'WL_1',
  'Wuling City': 'WL_2',
};

/**
 * Convert a resource node name (e.g. "Pink Bolete") to the
 * interactive-map marker type key (e.g. "pink_bolete_spot").
 *
 * Returns `undefined` if no matching marker type exists.
 */
export function resourceNameToMarkerType(name: string): string | undefined {
  // Check overrides first
  if (NAME_TO_TYPE_OVERRIDES[name]) {
    const key = NAME_TO_TYPE_OVERRIDES[name];
    return MARKER_TYPE_DICT[key] ? key : undefined;
  }

  // Standard convention: lowercase, spaces → underscores, append _spot
  const key = name.toLowerCase().replace(/ /g, '_') + '_spot';
  return MARKER_TYPE_DICT[key] ? key : undefined;
}

/**
 * Convert a map display name (e.g. "Valley IV") to a region ID
 * used by the interactive map (e.g. "valley-iv").
 */
export function mapNameToRegionId(mapName: string): string | undefined {
  return MAP_NAME_TO_REGION_ID[mapName];
}

/**
 * Convert a resource region name (e.g. "The Hub") to its
 * interactive map subregion ID (e.g. "VL_1").
 */
export function regionNameToSubregionId(
  regionName: string,
): string | undefined {
  return REGION_NAME_TO_SUBREGION_ID[regionName];
}

/**
 * Cluster markers into spatial groups using BFS flood-fill.
 * Markers within `threshold` map units of each other are grouped together.
 */
export function clusterMarkersByDistance(
  markers: IMarkerData[],
  threshold: number = 20,
): IMarkerData[][] {
  if (markers.length === 0) return [];

  const clusters: IMarkerData[][] = [];
  const assigned = new Set<number>();

  for (let i = 0; i < markers.length; i++) {
    if (assigned.has(i)) continue;

    const cluster: IMarkerData[] = [];
    const queue = [i];
    assigned.add(i);

    while (queue.length > 0) {
      const idx = queue.shift()!;
      cluster.push(markers[idx]);

      for (let j = 0; j < markers.length; j++) {
        if (assigned.has(j)) continue;
        const dx = markers[idx].position[0] - markers[j].position[0];
        const dy = markers[idx].position[1] - markers[j].position[1];
        if (Math.sqrt(dx * dx + dy * dy) < threshold) {
          assigned.add(j);
          queue.push(j);
        }
      }
    }

    clusters.push(cluster);
  }

  // Sort clusters by centroid (top-to-bottom, then left-to-right)
  clusters.sort((a, b) => {
    const centroidA = getCentroid(a);
    const centroidB = getCentroid(b);
    // Primary sort by Y (latitude), secondary by X (longitude)
    const dy = centroidA[0] - centroidB[0];
    if (Math.abs(dy) > 5) return dy;
    return centroidA[1] - centroidB[1];
  });

  return clusters;
}

function getCentroid(markers: IMarkerData[]): [number, number] {
  const sum = markers.reduce(
    (acc, m) => [acc[0] + m.position[0], acc[1] + m.position[1]],
    [0, 0],
  );
  return [sum[0] / markers.length, sum[1] / markers.length];
}

/**
 * Get the 0-based index of a resource node among all nodes
 * with the same name and region, sorted by order.
 */
export function getNodeIndexInRegion(
  nodeId: string,
  nodeName: string,
  nodeRegion: string,
): number {
  const sameGroup = resources.resources
    .filter((r) => r.name === nodeName && r.region === nodeRegion)
    .sort((a, b) => a.order - b.order);

  return Math.max(
    0,
    sameGroup.findIndex((r) => r.id === nodeId),
  );
}
