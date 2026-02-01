import React from 'react';

import SideNavButton from './SideNavButton';
import SideNavToggle from './SideNavToggle';

interface SideNavProps {
    views: Array<{
        name: string;
        icon: React.ComponentType;
    }>;
    activeView: string;
    setActiveView: (view: string) => void;
    navExpanded: boolean;
    setNavExpanded: (expanded: boolean) => void;
}

const SideNav: React.FC<SideNavProps> = ({ views, activeView, setActiveView, navExpanded, setNavExpanded }) => {
    const handleViewClick = (view: string) => {
        setActiveView(view);
        setNavExpanded(false);
    };

    return (
        <div className="side-nav-wrapper">
            <div className={`side-nav ${navExpanded ? 'side-nav--expanded' : ''}`}>
                {views.map((view) => (
                    <SideNavButton key={view.name} icon={view.icon} title={view.name} active={view.name === activeView} onClick={() => handleViewClick(view.name)} />
                ))}
                <SideNavToggle navExpanded={navExpanded} setNavExpanded={setNavExpanded} />
            </div>
        </div>
    );
};

export default SideNav;