import React from 'react';

interface SideNavButtonProps {
    icon: React.ComponentType;
    title: string;
    onClick: () => void;
    active: boolean;
}

const SideNavButton: React.FC<SideNavButtonProps> = ({ icon: Icon, title, onClick, active }) => {
    return (
        <div className="side-nav-button-wrap">
            <span className="side-nav-button-tooltip" aria-hidden>{title}</span>
            <button className={`side-nav-button ${active ? 'side-nav-button--active' : ''}`} aria-label={title}
                aria-current={active ? 'page' : undefined} onClick={onClick}>
                <span className="side-nav-button-icon"><Icon /></span>
                <span>{title}</span>
            </button>
        </div>
    );
};

export default SideNavButton;