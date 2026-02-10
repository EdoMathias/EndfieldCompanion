import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useFTUE } from '../../../contexts/FTUEContext';
import { FTUETooltip } from '../../../components';

const MapView: React.FC = () => {
  const { shouldShowStep } = useFTUE();

  const showMapCardStep = shouldShowStep('resources_map_card');
  const showOnMapButtonStep = shouldShowStep('resources_on_map_button');
  const forceFirstRegionExpanded = showMapCardStep || showOnMapButtonStep;

  return (
    <section
      className="map-container"
      // ref={containerRef}
    >
      <div className="map-placeholder">
        <h2>Map View</h2>
        <p>This is where the map will be displayed.</p>
      </div>
    </section>
  );
};

export default MapView;
