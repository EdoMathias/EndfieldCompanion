import React from 'react';
import { HotkeysWidget } from '../widgets/HotkeysWidget';

export const WidgetContainer: React.FC = () => {
  return (
    <div className="widgets-container">
      <div className="widgets-grid">
        {/* <GameTimeWidget /> */}
        <HotkeysWidget />
      </div>
    </div>
  );
};

