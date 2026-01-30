import React from 'react';

interface SideNavButtonProps {
    icon: string;
    title: string;
    onClick: () => void;
    active: boolean;
}

const SideNavButton: React.FC<SideNavButtonProps> = ({ icon, title, onClick, active }) => {
    return (
        <button className={`side-nav-button ${active ? 'side-nav-button--active' : ''}`} aria-label={title}
            aria-current={active ? 'page' : undefined} onClick={onClick}>
            {/* <img src={icon} alt="Side Nav Icon" />
            This is a placeholder for the icon. It will be replaced with the actual icon in the future. */}
            <span className="side-nav-button-icon">{icon}</span>
            <span>{title}</span>
        </button>
    );
};

export default SideNavButton;