import { IMarkerData } from "../../../../../shared/data/interactive-map/marker";

export interface IMapView {
    lat: number;
    lng: number;
    zoom: number;
}

export type LayerType = 'M' | 'L1' | 'L2' | 'L3' | 'B1' | 'B2' | 'B3' | 'B4';

export interface IMapCoreOptions {
    getViewState: (regionId: string) => IMapView | undefined;
    saveViewState: (regionId: string, view: IMapView) => void;
    onMarkerClick: (marker: IMarkerData) => void;
}