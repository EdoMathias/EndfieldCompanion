export interface ICollectedMarker {
    markerId: string;
    itemId?: string;
    itemName?: string;
    collected: boolean;
    collectedAt: number;
}