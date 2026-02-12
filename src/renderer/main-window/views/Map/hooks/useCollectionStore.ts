import { useState, useCallback, useEffect } from 'react';
import {
  createSimpleStore,
  DB_NAME,
} from '../../../../../shared/utils/indexedDBStorage';

const STORE_NAME = 'map-collected-markers';

interface CollectedMarkerData {
  markerId: string;
  collected: boolean;
  collectedAt: number;
}

const store = createSimpleStore<CollectedMarkerData>(DB_NAME, STORE_NAME);

export function useCollectionStore() {
  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load collected markers on mount
  useEffect(() => {
    async function loadCollected() {
      try {
        const all = await store.getAll();
        const ids = all.filter((m) => m.collected).map((m) => m.markerId);
        setCollectedIds(new Set(ids));
      } catch (e) {
        console.error('Failed to load collected markers:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadCollected();
  }, []);

  // Check if a marker is collected
  const isCollected = useCallback(
    (markerId: string) => {
      return collectedIds.has(markerId);
    },
    [collectedIds],
  );

  // Set collection state for a marker
  const setCollected = useCallback(
    async (markerId: string, collected: boolean) => {
      try {
        await store.set(markerId, {
          markerId,
          collected,
          collectedAt: collected ? Date.now() : 0,
        });

        setCollectedIds((prev) => {
          const next = new Set(prev);
          if (collected) {
            next.add(markerId);
          } else {
            next.delete(markerId);
          }
          return next;
        });
      } catch (e) {
        console.error('Failed to set collected state:', e);
      }
    },
    [],
  );

  // Toggle collection state
  const toggleCollected = useCallback(
    async (markerId: string) => {
      const current = collectedIds.has(markerId);
      await setCollected(markerId, !current);
    },
    [collectedIds, setCollected],
  );

  // Get all collected IDs as array
  const getCollectedIdsArray = useCallback(() => {
    return Array.from(collectedIds);
  }, [collectedIds]);

  // Get collected count
  const getCollectedCount = useCallback(() => {
    return collectedIds.size;
  }, [collectedIds]);

  // Clear all collected markers
  const clearAll = useCallback(async () => {
    try {
      await store.clear();
      setCollectedIds(new Set());
    } catch (e) {
      console.error('Failed to clear collected markers:', e);
    }
  }, []);

  // Export to JSON with file save dialog
  const exportToJson = useCallback(async () => {
    const all = await store.getAll();
    const collected = all.filter((m) => m.collected);
    const json = JSON.stringify(collected, null, 2);
    const filename = `collected-markers-${new Date().toISOString().split('T')[0]}.json`;

    // Try to use the File System Access API for native save dialog
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: 'JSON File',
              accept: { 'application/json': ['.json'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();
        return;
      } catch (e: any) {
        // User cancelled or API failed, fall back to download link
        if (e.name === 'AbortError') return;
      }
    }

    // Fallback: use download link
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Import from JSON
  const importFromJson = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const data: CollectedMarkerData[] = JSON.parse(text);

      for (const marker of data) {
        await store.set(marker.markerId, marker);
      }

      const ids = data.filter((m) => m.collected).map((m) => m.markerId);
      setCollectedIds((prev) => new Set([...prev, ...ids]));
    } catch (e) {
      console.error('Failed to import collected markers:', e);
      throw e;
    }
  }, []);

  return {
    collectedIds,
    isLoading,
    isCollected,
    setCollected,
    toggleCollected,
    getCollectedIdsArray,
    getCollectedCount,
    clearAll,
    exportToJson,
    importFromJson,
  };
}
