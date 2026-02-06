import { RotationActionType } from "../types/rotations.types";

/** LocalStorage key for the current rotation. Used by the desktop store and by the in-game window for real-time sync. */
export const STORAGE_CURRENT_ROTATION = 'endfield.rotations.current.v1';

export const ACTION_TYPE_CONFIG: Record<RotationActionType, { label: string; shortLabel: string; color: string }> = {
    final_strike: { label: 'Final Strike', shortLabel: 'Final', color: '#7E807C' },
    skill: { label: 'Skill', shortLabel: 'Skill', color: '#657136' },
    combo: { label: 'Combo', shortLabel: 'Combo', color: '#F8F546' },
    ultimate: { label: 'Ultimate', shortLabel: 'Ult', color: '#ff4655' },
};