import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/index.css';

// Components
import { AppHeader, FTUEWelcomeModal } from '../components';
import { AdContainer } from './components/AdContainer/AdContainer';
import SideNav from './components/SideNav/SideNav';
import { Settings } from './views/Settings';

// Contexts
import { FTUEProvider } from '../contexts/FTUEContext';

// Custom hooks
import { useWindowInfo } from '../hooks/useWindowInfo';
import { useAppVersion } from '../hooks/useAppVersion';

// Config
import { viewsConfig } from './config/views.config';

const Main: React.FC = () => {
    const { isIngameWindow } = useWindowInfo();
    const appVersion = useAppVersion();

    const [showSettings, setShowSettings] = React.useState(false);
    const [settingsInitialTab, setSettingsInitialTab] = React.useState<'general' | 'hotkeys' | 'about'>('general');

    //------------------------HEADER ACTION BUTTONS-----------------------------
    const handleSettingsClick = () => {
        setSettingsInitialTab('general');
        setShowSettings(true);
    };

    const handleSubmissionFormClick = () => {
        console.log('Submission form clicked');
        // overwolf.utils.openUrlInDefaultBrowser(
        //     'https://forms.gle/SJdNDZWE5cbNiXLL8'
        // );
    };

    const headerActionButtons: Array<{
        icon: string;
        title: string;
        onClick: () => void;
    }> = [
            {
                icon: '📝',
                title: 'Submit Feedback',
                onClick: handleSubmissionFormClick,
            },
            {
                icon: '⚙️',
                title: 'Settings',
                onClick: handleSettingsClick,
            },
        ];
    //------------------------HEADER ACTION BUTTONS-----------------------------

    // Convert views config to format expected by SideNav
    const views = viewsConfig.map(view => ({
        name: view.name,
        icon: view.icon,
    }));

    const defaultViewName = viewsConfig.find(view => view.active)?.name ?? viewsConfig[0].name;
    const [activeView, setActiveView] = React.useState(defaultViewName);

    const [navExpanded, setNavExpanded] = React.useState(false);

    const handleFTUEReset = React.useCallback(() => {
        setShowSettings(false);
        setActiveView(defaultViewName);
        setNavExpanded(false);
    }, [defaultViewName]);

    // Get the active view component
    const activeViewConfig = viewsConfig.find(view => view.name === activeView);
    const ActiveViewComponent = activeViewConfig?.component;

    return (
        <FTUEProvider onReset={handleFTUEReset}>
        <div className="app-layout">

            <div className="app-header-wrapper">
                <AppHeader
                    title={
                        isIngameWindow ?
                            'Arknights Companion • In-Game' :
                            'Arknights Companion • Desktop'
                    }
                    appVersion={appVersion ?? undefined}
                    showHotkey={isIngameWindow}
                    actionButtons={headerActionButtons}
                />
            </div>

            <div className="app-body">
                <SideNav views={views} activeView={activeView} setActiveView={setActiveView} navExpanded={navExpanded} setNavExpanded={setNavExpanded} />

                <main className="main-content">
                    {navExpanded && (
                        <button
                            type="button"
                            className="side-nav-overlay"
                            onClick={() => setNavExpanded(false)}
                            aria-label="Close menu"
                        />
                    )}
                    <div className="main-content-wrapper">
                        <FTUEWelcomeModal />
                        <div className="main-content-container">
                            {showSettings ? (
                                <div className="settings-wrapper">
                                    <Settings
                                        initialTab={settingsInitialTab}
                                        onClose={() => setShowSettings(false)}
                                    />
                                </div>
                            ) : (
                                ActiveViewComponent && <ActiveViewComponent />
                            )}
                        </div>
                    </div>
                </main>

                <aside className="ad-sidebar">
                    <AdContainer
                        width={400}
                        height={60}
                        className="ad-container-small"
                    />
                    <AdContainer
                        width={400}
                        height={600}
                        className="ad-container"
                    />
                </aside>
            </div>
        </div>
        </FTUEProvider>
    );
};

const mountMain = () => {
    const container = document.getElementById('root');
    if (!container) {
        console.error('Main root element not found');
        return;
    }

    const root = createRoot(container);
    root.render(<Main />);
};

const bootstrap = async () => {
    mountMain();
};

bootstrap().catch((error) => {
    console.error('Failed to bootstrap main window', error);
});
