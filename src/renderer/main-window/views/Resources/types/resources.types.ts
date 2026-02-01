export type ServerRegion = "ASIA_UTC8" | "AMER_EU_UTC_MINUS_5";

export type ResourceType = "Rare Growth" | "Rare Ores"

export type ResourceNode = {
    id: string;
    name: string;
    type: ResourceType;

    map: string;      // e.g. "Valley IV"
    region: string;   // e.g. "The Hub"
    mapLocationImage: string;
    nodeImage: string; // Path to the node's image

    max: number;      // user controlled
    current: number;  // user controlled (0..max)

    enabled: boolean;
    tracked: boolean;
    order: number;
};