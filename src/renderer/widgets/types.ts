/**
 * Widget type definitions
 */

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  enabled: boolean;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export enum WidgetType {
  HOTKEYS = 'hotkeys'
}