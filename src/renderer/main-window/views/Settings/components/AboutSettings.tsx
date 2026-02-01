import React from 'react';

const AboutSettings: React.FC = () => {
  return (
    <div className="settings-section">
      <h3 className="settings-section-title">About Arknights Companion</h3>
      <p className="settings-section-description">
        Arknights Companion is an unofficial companion app for Arknights: Endfield, designed to help you track
        resources, rotations, and other in-game information.
      </p>

      <p className="settings-section-caption">
        Images used in this app were taken from the interactive map at{' '}
        <a
          href="https://game.skport.com/map/endfield"
          target="_blank"
          rel="noopener noreferrer"
          className="settings-about-link"
        >
          game.skport.com/map/endfield
        </a>
        .
      </p>

      <div className="settings-about-copyright">
        <p className="settings-copyright-text">
          Endfield and related marks are trademarks of their respective owners. This application is
          a fan-made project and is not affiliated with, endorsed, or sponsored by the game developers.
        </p>
      </div>
    </div>
  );
};

export default AboutSettings;
