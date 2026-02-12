/**
 * Resource helper
 */

export const getLocalTileResourceUrl = (regionId: string) => {
    return `../map-img/tiles/${regionId}/{z}/{x}_{y}.webp`
}

export const getLocalMarkerResourceUrl = (itemType: string) => {
    return `../items-img/map/${itemType}.webp`
}