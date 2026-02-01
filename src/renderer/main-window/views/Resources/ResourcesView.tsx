import React, { useMemo, useState, useRef } from 'react';
import { useResourcesStore } from './hooks/useResourcesStore';
import { useFTUE } from '../../../contexts/FTUEContext';
import { FTUETooltip } from '../../../components';
import ResourcesHeader from './components/ResourcesHeader';
import RegionGroup from './components/RegionGroup';
import MapLocationModal from './components/MapLocationModal';
import { ResourceNode } from './types/resources.types';

const ResourcesView: React.FC = () => {

    const { nodes, serverRegion, setServerRegion, selectedMap, setSelectedMap, toggleNodeTracking, setCurrentNodeNumber, setMaxNodeNumber, clearCurrentNodeNumber, toggleRegionCollapsed, isRegionCollapsed, explorationLevel, setExplorationLevel } = useResourcesStore();
    const { shouldShowStep } = useFTUE();

    const showMapCardStep = shouldShowStep('resources_map_card');
    const showOnMapButtonStep = shouldShowStep('resources_on_map_button');
    const forceFirstRegionExpanded = showMapCardStep || showOnMapButtonStep;
    
    const [selectedNodeForMap, setSelectedNodeForMap] = useState<ResourceNode | null>(null);
    const containerRef = useRef<HTMLElement>(null);

    const filteredNodes = useMemo(() => {
        return nodes.filter(node => node.map === selectedMap);
    }, [nodes, selectedMap]);

    const nodesByRegion = useMemo(() => {
        const grouped: Record<string, ResourceNode[]> = {};
        filteredNodes.forEach(node => {
            if (!grouped[node.region]) {
                grouped[node.region] = [];
            }
            grouped[node.region].push(node);
        });
        // Sort nodes within each region by their order
        Object.keys(grouped).forEach(region => {
            grouped[region].sort((a, b) => a.order - b.order);
        });
        return grouped;
    }, [filteredNodes]);

    const sortedRegions = useMemo(() => {
        // Custom region order
        const regionOrder = [
            'The Hub',
            'Valley Pass',
            'Aburrey Quarry',
            'Originium Science Park',
            'Origin Lodespring',
            'Power Plateau'
        ];

        const regions = Object.keys(nodesByRegion);
        
        // Sort regions according to the custom order
        return regions.sort((a, b) => {
            const indexA = regionOrder.indexOf(a);
            const indexB = regionOrder.indexOf(b);
            
            // If both regions are in the order list, sort by their index
            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }
            // If only one is in the list, prioritize it
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            // If neither is in the list, sort alphabetically
            return a.localeCompare(b);
        });
    }, [nodesByRegion]);

    const stats = useMemo(() => {
        const maxedNodes = filteredNodes.filter(node => node.current >= node.max && node.max > 0).length;
        const totalGatherables = filteredNodes.reduce((sum, node) => sum + node.current, 0);
        return { maxedNodes, totalGatherables };
    }, [filteredNodes]);

    return (
        <section className="resources-container" ref={containerRef}>
            <ResourcesHeader 
                serverRegion={serverRegion} 
                onServerRegionChange={setServerRegion}
                selectedMap={selectedMap}
                onMapChange={setSelectedMap}
                maxedNodes={stats.maxedNodes}
                totalGatherables={stats.totalGatherables}
                explorationLevel={explorationLevel}
                onExplorationLevelChange={setExplorationLevel}
            />

            <div className="resources-regions">
                {sortedRegions.map(region => (
                    <RegionGroup
                        key={region}
                        region={region}
                        nodes={nodesByRegion[region]}
                        isExpanded={forceFirstRegionExpanded && region === sortedRegions[0] ? true : !isRegionCollapsed(region)}
                        onToggleExpanded={() => toggleRegionCollapsed(region)}
                        onCurrentNumberChange={setCurrentNodeNumber}
                        onMaxNumberChange={setMaxNodeNumber}
                        onClearCurrentNumber={clearCurrentNodeNumber}
                        onToggleTracking={toggleNodeTracking}
                        onOpenMapLocation={(node) => setSelectedNodeForMap(node)}
                        explorationLevel={explorationLevel}
                        isFirstRegion={region === sortedRegions[0]}
                    />
                ))}
            </div>

            <MapLocationModal
                isOpen={selectedNodeForMap !== null}
                mapLocationImage={selectedNodeForMap?.mapLocationImage || ''}
                nodeName={selectedNodeForMap?.name || ''}
                onClose={() => setSelectedNodeForMap(null)}
                containerRef={containerRef}
            />

            <FTUETooltip
                step="resources_header"
                title="Resources header"
                message="This header shows daily reset time, map and server selection, exploration level, and your maxed nodes and total gatherables. Use it to switch maps and track your progress."
                position="bottom"
                targetSelector='[data-ftue="resources-header"]'
            />
            <FTUETooltip
                step="resources_map_card"
                title="Resource node card"
                message="Each card shows a resource node. You can click the current or max number to edit them manually and keep track of your gathering progress. Please note that you'll need to manually edit the max amount since we currently don't support auto-tracking."
                position="bottom"
                targetSelector='[data-ftue="resources-map-card"]'
            />
            <FTUETooltip
                step="resources_on_map_button"
                title="Show on Map"
                message="Click this button to open a map view with the node's location highlighted. Use it to find where to gather this resource in-game."
                position="top"
                targetSelector='[data-ftue="resources-on-map-button"]'
            />
        </section>
    );
};

export default ResourcesView;
