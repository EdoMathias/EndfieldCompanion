import React from 'react';
import { createRoot } from 'react-dom/client';


import '../styles/index.css';

// Components
import { AppHeader } from '../components';

// Custom hooks
import { useWindowInfo } from '../hooks/useWindowInfo';
import { useAppVersion } from '../hooks/useAppVersion';

const Main: React.FC = () => {
    const { isIngameWindow } = useWindowInfo();
    const appVersion = useAppVersion();

    //------------------------HEADER ACTION BUTTONS-----------------------------
    const handleSettingsClick = () => {
        console.log('Settings clicked');
        // setSettingsInitialTab('general');
        // setShowSettings(true);
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

    return (
        <>
            <AppHeader
                title={
                    isIngameWindow ?
                        'Endfield Companion • In-Game' :
                        'Endfield Companion • Desktop'
                }
                appVersion={appVersion ?? undefined}
                showHotkey={isIngameWindow}
                actionButtons={headerActionButtons}
            />
            <p>Main Window</p>
        </>
    );
};

const mountMain = () => {
    const container = document.getElementById('root');
    if (!container) {
        console.error('Main root element not found');
        return;
    }

    const root = createRoot(container);
    root.render(
        <Main />
    );
};

const bootstrap = async () => {
    mountMain();
};

bootstrap().catch((error) => {
    console.error('Failed to bootstrap main window', error);
});
