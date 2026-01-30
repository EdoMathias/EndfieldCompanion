import React from 'react';

export interface ViewConfig {
    name: string;
    icon: string;
    component: React.ComponentType;
    active?: boolean;
}
