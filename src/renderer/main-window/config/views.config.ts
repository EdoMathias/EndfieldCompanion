import React from 'react';
import { ViewConfig } from '../types/views.types';
import { RareGrowth, Rotations } from '../views';

export const viewsConfig: ViewConfig[] = [
    {
        name: 'Rare Growth',
        icon: '🌱',
        component: RareGrowth,
        active: true,
    },
    {
        name: 'Rotations',
        icon: '🔄',
        component: Rotations,
        active: false,
    },
];
