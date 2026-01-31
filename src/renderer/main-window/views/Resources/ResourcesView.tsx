import React, { useMemo } from 'react';
import { useResourcesStore } from './hooks/useResourcesStore';
import ResourcesHeader from './components/ResourcesHeader';
import RegionGroup from './components/RegionGroup';
import { ResourceNode } from './types/resources.types';

const ResourcesView: React.FC = () => {

    const { nodes, serverRegion, setServerRegion, selectedMap, setSelectedMap, toggleNodeTracking, setCurrentNodeNumber, setMaxNodeNumber, clearCurrentNodeNumber, toggleRegionCollapsed, isRegionCollapsed } = useResourcesStore();

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
        <section className="resources-container">
            <ResourcesHeader 
                serverRegion={serverRegion} 
                onServerRegionChange={setServerRegion}
                selectedMap={selectedMap}
                onMapChange={setSelectedMap}
                maxedNodes={stats.maxedNodes}
                totalGatherables={stats.totalGatherables}
            />

            <div className="resources-regions">
                {sortedRegions.map(region => (
                    <RegionGroup
                        key={region}
                        region={region}
                        nodes={nodesByRegion[region]}
                        isExpanded={!isRegionCollapsed(region)}
                        onToggleExpanded={() => toggleRegionCollapsed(region)}
                        onCurrentNumberChange={setCurrentNodeNumber}
                        onMaxNumberChange={setMaxNodeNumber}
                        onClearCurrentNumber={clearCurrentNodeNumber}
                        onToggleTracking={toggleNodeTracking}
                        onOpenMapLocation={() => {}}
                    />
                ))}
            </div>
        </section>
    );
};

export default ResourcesView;
