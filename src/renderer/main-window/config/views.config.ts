import { ViewConfig } from '../types/views.types';
import { ResourcesView, Rotations } from '../views';
import RareGrowthIcon from '../views/Resources/components/RareGrowthIcon';
import RotationsIcon from '../views/Rotations/components/RotationsIcon';
import MapView from '../views/Map/MapView';
import InteractiveMapIcon from '../views/Map/components/InteractiveMapIcon';

export const viewsConfig: ViewConfig[] = [
  {
    name: 'Resources',
    icon: RareGrowthIcon,
    component: ResourcesView,
    active: true,
  },
  {
    name: 'Rotations',
    icon: RotationsIcon,
    component: Rotations,
    active: false,
  },
  {
    name: 'Interactive Map',
    icon: InteractiveMapIcon,
    component: MapView,
    active: false,
  },
];
