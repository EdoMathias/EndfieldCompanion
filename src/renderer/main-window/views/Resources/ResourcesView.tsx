import React from 'react';
import { useResourcesStore } from './hooks/useResourcesStore';
import ResourcesHeader from './components/ResourcesHeader';
import ResourceNodeCard from './components/ResourceNodeCard';

const ResourcesView: React.FC = () => {

    const { nodes, serverRegion, setServerRegion, toggleNodeTracking, setCurrentNodeNumber, setMaxNodeNumber, clearCurrentNodeNumber } = useResourcesStore();

    return (
        <section className="resources-container">
            <ResourcesHeader serverRegion={serverRegion} onServerRegionChange={setServerRegion} />

            <div className="resources-grid">
                {nodes.map(node => (
                    <ResourceNodeCard key={node.id} node={node} onCurrentNumberChange={setCurrentNodeNumber} onMaxNumberChange={setMaxNodeNumber} onClearCurrentNumber={clearCurrentNodeNumber} onToggleTracking={toggleNodeTracking} onOpenMapLocation={() => {}} />
                ))}
            </div>
        </section>
    );
};

export default ResourcesView;
