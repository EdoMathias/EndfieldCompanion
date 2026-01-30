import React from 'react';
import { ViewConfig } from '../types/views.types';
import { ResourcesView, Rotations } from '../views';

export const viewsConfig: ViewConfig[] = [
    {
        name: 'Resources',
        icon: '🌱',
        component: ResourcesView,
        active: true,
    },
    {
        name: 'Rotations',
        icon: '🔄',
        component: Rotations,
        active: false,
    },
];
