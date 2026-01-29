import React, { useState } from 'react';
import { Modal } from '../../../components';
import {
  SettingsSidebar,
  GeneralSettings,
  DataSettings,
  AboutSettings,
  HotkeysSettings,
  SettingsInfo,
} from './components';

interface SettingsProps {
  onClose: () => void;
  initialTab?: 'general' | 'hotkeys' | 'data' | 'about';
}

const Settings: React.FC<SettingsProps> = ({
  onClose,
  initialTab = 'general',
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'hotkeys' | 'data' | 'about'>(initialTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'hotkeys':
        return <HotkeysSettings />;
      case 'data':
        return <DataSettings />;
      case 'about':
        return <AboutSettings />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="settings-page">
        <div className="settings-header">
          <button
            className="settings-back-button"
            onClick={onClose}
            title="Go Back"
          >
            ←
          </button>
          <h2>Settings</h2>
        </div>
        <div className="settings-container">
          <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="settings-main">
            {renderContent()}
          </div>
          <SettingsInfo tab={activeTab} />
        </div>
      </div>

    </>
  );
};

export default Settings;
