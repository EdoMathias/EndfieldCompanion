import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/index.css';

// Components
import { AppHeader, FTUEWelcomeModal, ReleaseNotesModal } from '../components';
import { AdContainer } from './components/AdContainer/AdContainer';
import SideNav from './components/SideNav/SideNav';
import { Settings } from './views/Settings';

// Contexts
import { FTUEProvider, useFTUE } from '../contexts/FTUEContext';

// Custom hooks
import { useWindowInfo } from '../hooks/useWindowInfo';
import { useAppVersion } from '../hooks/useAppVersion';
import { useReleaseNotes } from '../hooks/useReleaseNotes';

// Config
import { viewsConfig } from './config/views.config';
import { kHotkeys } from '../../shared/consts';
import { HotkeysAPI } from '../../shared/services/hotkeys';

const DEFAULT_HOTKEYS = {
  toggleMainIngameWindow: 'Ctrl+T',
  toggleMainDesktopWindow: 'Ctrl+Shift+T',
};

function displayHotkey(
  binding: string | undefined,
  unassigned: boolean,
): string {
  if (
    unassigned ||
    !binding ||
    binding === 'Unassigned' ||
    binding.trim() === ''
  ) {
    return '';
  }
  return binding;
}

const defaultViewName =
  viewsConfig.find((view) => view.active)?.name ?? viewsConfig[0].name;
const ACTIVE_VIEW_STORAGE_KEY = 'endfield_companion_active_view';

/**
 * Inner component that lives inside FTUEProvider so it can consume the FTUE
 * context (e.g. to gate release-notes auto-open on FTUE completion).
 */
const MainInner: React.FC<{ resetTrigger: number }> = ({ resetTrigger }) => {
  const { isIngameWindow } = useWindowInfo();
  const { isFTUEComplete } = useFTUE();
  const appVersion = useAppVersion();
  const {
    releaseNote,
    isOpen: isReleaseNotesOpen,
    dismiss: dismissReleaseNotes,
    open: openReleaseNotes,
  } = useReleaseNotes(appVersion, isFTUEComplete);

  const [showSettings, setShowSettings] = React.useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = React.useState<
    'general' | 'hotkeys' | 'about'
  >('general');
  const [toggleHotkeys, setToggleHotkeys] = useState<{
    inGame: string;
    desktop: string;
  }>({
    inGame: DEFAULT_HOTKEYS.toggleMainIngameWindow,
    desktop: DEFAULT_HOTKEYS.toggleMainDesktopWindow,
  });

  const [activeView, setActiveView] = React.useState(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_VIEW_STORAGE_KEY);
      if (stored && viewsConfig.some((v) => v.name === stored)) {
        return stored;
      }
    } catch {
      // Ignore errors
    }
    return defaultViewName;
  });
  const [navExpanded, setNavExpanded] = React.useState(false);

  // Persist active view to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_VIEW_STORAGE_KEY, activeView);
    } catch {
      // Ignore errors
    }
  }, [activeView]);

  // React to FTUE reset (triggered by the parent via resetTrigger)
  useEffect(() => {
    if (resetTrigger > 0) {
      setShowSettings(false);
      setActiveView(defaultViewName);
      setNavExpanded(false);
    }
  }, [resetTrigger]);

  const loadHotkeys = React.useCallback(async () => {
    try {
      const hotkeysMap = await HotkeysAPI.fetchAll();
      const inGame = hotkeysMap.get(kHotkeys.toggleMainIngameWindow);
      const desktop = hotkeysMap.get(kHotkeys.toggleMainDesktopWindow);
      setToggleHotkeys({
        inGame:
          displayHotkey(inGame?.binding, inGame?.IsUnassigned ?? true) ||
          DEFAULT_HOTKEYS.toggleMainIngameWindow,
        desktop:
          displayHotkey(desktop?.binding, desktop?.IsUnassigned ?? true) ||
          DEFAULT_HOTKEYS.toggleMainDesktopWindow,
      });
    } catch {
      setToggleHotkeys({
        inGame: DEFAULT_HOTKEYS.toggleMainIngameWindow,
        desktop: DEFAULT_HOTKEYS.toggleMainDesktopWindow,
      });
    }
  }, []);

  useEffect(() => {
    loadHotkeys();
    const onHotkeysChanged = () => loadHotkeys();
    overwolf.settings.hotkeys.onChanged.addListener(onHotkeysChanged);
    return () => {
      overwolf.settings.hotkeys.onChanged.removeListener(onHotkeysChanged);
    };
  }, [loadHotkeys]);

  //------------------------HEADER ACTION BUTTONS-----------------------------
  const handleSettingsClick = () => {
    setSettingsInitialTab('general');
    setShowSettings(true);
  };

  const handleSubmissionFormClick = () => {
    console.log('Submission form clicked');
    overwolf.utils.openUrlInDefaultBrowser(
      'https://forms.gle/sNW48XMehCALrYAq9',
    );
  };

  const openDiscord = () => {
    overwolf.utils.openUrlInDefaultBrowser('https://discord.gg/NdStdHah');
  };

  const discordIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
    </svg>
  );

  const headerActionButtons: Array<{
    icon: string | React.ReactNode;
    title: string;
    onClick: () => void;
  }> = [
    {
      icon: discordIcon,
      title: 'Join our Discord!',
      onClick: openDiscord,
    },
    {
      icon: '🆕',
      title: "What's New",
      onClick: openReleaseNotes,
    },
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
  const views = viewsConfig.map((view) => ({
    name: view.name,
    icon: view.icon,
  }));

  // Get the active view component
  const activeViewConfig = viewsConfig.find((view) => view.name === activeView);
  const ActiveViewComponent = activeViewConfig?.component;

  return (
    <div className="app-layout">
      <div className="app-header-wrapper">
        <AppHeader
          title={
            isIngameWindow
              ? 'Arknights Companion • In-Game'
              : 'Arknights Companion • Desktop'
          }
          appVersion={appVersion ?? undefined}
          showHotkey={true}
          hotkeyTextInGame={toggleHotkeys.inGame}
          hotkeyTextDesktop={toggleHotkeys.desktop}
          actionButtons={headerActionButtons}
        />
      </div>

      <div className="app-body">
        <SideNav
          views={views}
          activeView={activeView}
          setActiveView={setActiveView}
          navExpanded={navExpanded}
          setNavExpanded={setNavExpanded}
        />

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
            <ReleaseNotesModal
              isOpen={isReleaseNotesOpen}
              note={releaseNote}
              onClose={dismissReleaseNotes}
              scope="content"
            />
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
          <AdContainer width={400} height={60} className="ad-container-small" />
          <AdContainer width={400} height={600} className="ad-container" />
        </aside>
      </div>
    </div>
  );
};

/**
 * Top-level component. Provides the FTUE context so that MainInner can
 * consume it (e.g. to defer the release-notes modal until FTUE finishes).
 */
const Main: React.FC = () => {
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleFTUEReset = React.useCallback(() => {
    setResetTrigger((t) => t + 1);
  }, []);

  return (
    <FTUEProvider onReset={handleFTUEReset}>
      <MainInner resetTrigger={resetTrigger} />
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
