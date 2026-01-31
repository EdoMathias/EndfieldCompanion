import React, { useMemo } from 'react';
import { useResourcesStore } from './hooks/useResourcesStore';
import ResourcesHeader from './components/ResourcesHeader';
import ResourceNodeCard from './components/ResourceNodeCard';

const ResourcesView: React.FC = () => {

    const { nodes, serverRegion, setServerRegion, selectedMap, setSelectedMap, toggleNodeTracking, setCurrentNodeNumber, setMaxNodeNumber, clearCurrentNodeNumber } = useResourcesStore();

    const filteredNodes = useMemo(() => {
        return nodes.filter(node => node.map === selectedMap);
    }, [nodes, selectedMap]);

    return (
        <section className="resources-container">
            <ResourcesHeader 
                serverRegion={serverRegion} 
                onServerRegionChange={setServerRegion}
                selectedMap={selectedMap}
                onMapChange={setSelectedMap}
            />

            <div className="resources-grid">
                {filteredNodes.map(node => (
                    <ResourceNodeCard key={node.id} node={node} onCurrentNumberChange={setCurrentNodeNumber} onMaxNumberChange={setMaxNodeNumber} onClearCurrentNumber={clearCurrentNodeNumber} onToggleTracking={toggleNodeTracking} onOpenMapLocation={() => {}} />
                ))}
            </div>
        </section>
    );
};

export default ResourcesView;
