/**
 * Resource fetchers helper
 * getLocal is used for debugging with local files, getRemote is used for fetching from the server
 */

import { baseUrl } from '../../../../../shared/consts';

export const getLocalTileResourceUrl = (regionId: string) => {
  return `../map-img/tiles/${regionId}/{z}/{x}_{y}.webp`;
};

export const getLocalMarkerResourceUrl = (itemType: string) => {
  return `../items-img/map/${itemType}.webp`;
};

export const getRemoteTileResourceUrl = (regionId: string) => {
  return `${baseUrl}/map-tiles/${regionId}/{z}/{x}_{y}.webp`;
};

export const getRemoteMarkerResourceUrl = (itemType: string) => {
  return `${baseUrl}/map-icon/${itemType}.webp`;
};

// ----- Marker icon cache (fetch once, serve as blob URL) -----
const iconCache = new Map<string, string>(); // type -> blob URL
const iconFetchPromises = new Map<string, Promise<string>>(); // in-flight dedup

/**
 * Returns a cached blob URL for a marker icon.
 * First call fetches from server and caches; subsequent calls return instantly.
 */
export async function getCachedMarkerIconUrl(
  itemType: string,
): Promise<string> {
  // Already cached
  if (iconCache.has(itemType)) {
    return iconCache.get(itemType)!;
  }

  // Deduplicate in-flight fetches for the same type
  if (iconFetchPromises.has(itemType)) {
    return iconFetchPromises.get(itemType)!;
  }

  const promise = fetch(getRemoteMarkerResourceUrl(itemType))
    .then(async (res) => {
      if (!res.ok) throw new Error(`Failed to fetch icon: ${itemType}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      iconCache.set(itemType, blobUrl);
      iconFetchPromises.delete(itemType);
      return blobUrl;
    })
    .catch(() => {
      iconFetchPromises.delete(itemType);
      // Fallback to direct remote URL (browser will fetch normally)
      return getRemoteMarkerResourceUrl(itemType);
    });

  iconFetchPromises.set(itemType, promise);
  return promise;
}

/**
 * Preload all marker icons for a set of types.
 * Call this once when loading a region to warm the cache.
 */
export async function preloadMarkerIcons(types: string[]): Promise<void> {
  const uncached = types.filter((t) => !iconCache.has(t));
  await Promise.all(uncached.map((t) => getCachedMarkerIconUrl(t)));
}

/**
 * Get a cached marker icon URL synchronously.
 * Returns the cached blob URL if available, otherwise the remote URL.
 */
export function getMarkerIconUrl(itemType: string): string {
  return iconCache.get(itemType) ?? getRemoteMarkerResourceUrl(itemType);
}
