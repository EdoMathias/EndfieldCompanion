import React from 'react';
import { Button } from '../../../../components';
import { kWindowNames } from '../../../../../shared/consts';
import { MessageType } from '../../../../../main/services';

const WindowSettings: React.FC = () => {
  const handleCenterRotationWindow = () => {
    overwolf.windows.sendMessage(
      kWindowNames.background,
      MessageType.CENTER_ROTATION_WINDOW,
      null,
      (result) => {
        if (!result.success) {
          console.error('Failed to center rotation window:', result.error);
        }
      },
    );
  };

  return (
    <div className="settings-section">
      <h3 className="settings-section-title">Rotation Window</h3>
      <p className="settings-section-description">
        If the rotation window is stuck outside the visible area, use this
        button to reset its position to the center of the screen.
      </p>
      <Button variant="secondary" onClick={handleCenterRotationWindow}>
        Reset Rotation Window Position
      </Button>
    </div>
  );
};

export default WindowSettings;
