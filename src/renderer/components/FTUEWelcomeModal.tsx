import React, { useEffect, useState } from 'react';
import { useFTUE } from '../contexts/FTUEContext';
import { OWHotkeys } from '@overwolf/overwolf-api-ts';
import { kHotkeys, kEndfieldClassId } from '../../shared/consts';
import Button from '../main-window/views/Settings/components/Button';
import { createLogger } from '../../shared/services/Logger';

const logger = createLogger('FTUEWelcomeModal');

export const FTUEWelcomeModal: React.FC = () => {
  const { shouldShowStep, markStepComplete } = useFTUE();
  const [hotkeys, setHotkeys] = useState<{
    toggleMainIngameWindow: string;
    toggleMainDesktopWindow: string;
  }>({
    toggleMainIngameWindow: 'Ctrl+G',
    toggleMainDesktopWindow: 'Ctrl+Shift+G',
  });

  const show = shouldShowStep('welcome');

  useEffect(() => {
    if (!show) return;

    const loadHotkeys = async () => {
      try {
        const [toggleMainIngameWindow, toggleMainDesktopWindow] = await Promise.all([
          OWHotkeys.getHotkeyText(kHotkeys.toggleMainIngameWindow),
          OWHotkeys.getHotkeyText(kHotkeys.toggleMainDesktopWindow),
        ]);
        setHotkeys({ toggleMainIngameWindow, toggleMainDesktopWindow });
      } catch (error) {
        logger.error('Error loading hotkeys:', error);
      }
    };

    loadHotkeys();
  }, [show]);

  if (!show) return null;

  const handleGotIt = () => {
    markStepComplete('welcome');
  };

  return (
    <div className="ftue-overlay">
      <div className="ftue-welcome-modal">
        <div className="ftue-welcome-header">
          <h2>Welcome to Arknights Companion!</h2>
          <p className="ftue-welcome-subtitle">
            Your companion app for Arknights Endfield.
          </p>
        </div>

        <div className="ftue-welcome-content">
          <div className="ftue-feature">
            <div className="ftue-feature-icon">⚙️</div>
            <div className="ftue-feature-info">
              <h3>Window Management</h3>
              <p>Control your app windows with customizable hotkeys.</p>
              <span>Show/Hide the window in-game with: </span>
              <div className="ftue-hotkey-badge">{hotkeys.toggleMainIngameWindow}</div>
              <br />
              <span>Show/Hide the window on desktop with: </span>
              <div className="ftue-hotkey-badge">{hotkeys.toggleMainDesktopWindow}</div>
            </div>
          </div>

          <div className="ftue-welcome-footer">
            <Button onClick={handleGotIt} variant="primary" size="large">
              Got it!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

