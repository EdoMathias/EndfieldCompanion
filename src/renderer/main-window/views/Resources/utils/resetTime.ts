import type { ServerRegion } from "../types/resources.types";

export function getRegionOffsetMinutes(region: ServerRegion): number {
    return region === "ASIA_UTC8" ? 8 * 60 : -5 * 60;
}

/**
 * Returns the reset "key" of the most recent reset at/before `now`.
 * Key format: YYYY-MM-DD (in server-local day terms).
 */
export function getMostRecentResetKey(now: Date, region: ServerRegion): string {
    const offsetMin = getRegionOffsetMinutes(region);

    // Convert now -> server-local clock (represented using UTC getters)
    const serverNowMs = now.getTime() + offsetMin * 60_000;
    const serverNow = new Date(serverNowMs);

    const y = serverNow.getUTCFullYear();
    const m = serverNow.getUTCMonth();
    const d = serverNow.getUTCDate();

    // 04:00 server-local (represented in UTC-based Date)
    const resetTodayServerLocal = new Date(Date.UTC(y, m, d, 4, 0, 0, 0));

    const mostRecent =
        serverNowMs < resetTodayServerLocal.getTime()
            ? new Date(Date.UTC(y, m, d - 1, 4, 0, 0, 0))
            : resetTodayServerLocal;

    return toKey(mostRecent);
}

/**
 * Returns the next reset moment in real UTC time (as a Date).
 */
export function getNextResetUtc(now: Date, region: ServerRegion): Date {
    const offsetMin = getRegionOffsetMinutes(region);

    const serverNowMs = now.getTime() + offsetMin * 60_000;
    const serverNow = new Date(serverNowMs);

    const y = serverNow.getUTCFullYear();
    const m = serverNow.getUTCMonth();
    const d = serverNow.getUTCDate();

    const resetTodayServerLocal = new Date(Date.UTC(y, m, d, 4, 0, 0, 0));
    const nextResetServerLocal =
        serverNowMs < resetTodayServerLocal.getTime()
            ? resetTodayServerLocal
            : new Date(Date.UTC(y, m, d + 1, 4, 0, 0, 0));

    // Convert server-local reset -> real UTC by subtracting offset
    const nextResetUtcMs = nextResetServerLocal.getTime() - offsetMin * 60_000;
    return new Date(nextResetUtcMs);
}

/**
 * Calculates the number of days between two keys.
 * Will help to determine how many items to increment by when the app launches.
 * @param fromKey - The key to start from
 * @param toKey - The key to end at
 * @returns The number of days between the two keys
 */
export function diffDaysKeys(fromKey: string, toKey: string): number {
    const from = keyToUtcMidnight(fromKey);
    const to = keyToUtcMidnight(toKey);
    const days = Math.round((to - from) / 86_400_000);
    return Math.max(0, days);
}

/**
 * Converts a key to a UTC midnight timestamp.
 * @param key - The key to convert
 * @returns The UTC midnight timestamp
 */
function keyToUtcMidnight(key: string): number {
    const [y, m, d] = key.split("-").map(Number);
    return Date.UTC(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Converts a date to a key.
 * @param dt - The date to convert
 * @returns The key
 */
function toKey(dt: Date): string {
    const yy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(dt.getUTCDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
}

/**
 * Formats a countdown in the format of HH:MM:SS.
 * @param ms - The countdown in milliseconds
 * @returns The formatted countdown
 */
export function formatCountdown(ms: number): string {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
}
