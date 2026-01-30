import React from 'react';
import { useResourcesStore } from './hooks/useResourcesStore';
import ResourcesHeader from './components/ResourcesHeader';

const ResourcesView: React.FC = () => {

    const { nodes, serverRegion, setServerRegion, setCurrentNodeNumber, setMaxNodeNumber, clearCurrentNodeNumber } = useResourcesStore();

    return (
        <section className="resources-container">
            <ResourcesHeader serverRegion={serverRegion} onServerRegionChange={setServerRegion} />
            {/* Add your Rare Growth view content here */}
        </section>
    );
};

export default ResourcesView;
