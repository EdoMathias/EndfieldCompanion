export type ServerRegion = "ASIA_UTC8" | "AMER_EU_UTC_MINUS_5";

export type ResourceNode = {
    id: string;
    name: string;

    map: string;      // e.g. "Valley IV"
    region: string;   // e.g. "The Hub"

    max: number;      // user controlled
    current: number;  // user controlled (0..max)

    enabled: boolean;
    tracked: boolean;
    order: number;
};