// Game class IDs for supported games
export const kEndfieldClassId = 27724;

export const kWindowNames = {
  background: 'background',
  trackerDesktop: 'tracker_desktop',
  trackerIngame: 'tracker_ingame',
};

export const kHotkeys = {
  toggleTrackerIngameWindow: 'Toggle In-Game Tracker',
  toggleTrackerDesktopWindow: 'Toggle Desktop Tracker',
};

export type HotkeyData = {
  name: string;
  title: string;
  binding: string;
  modifiers: overwolf.settings.hotkeys.HotkeyModifiers;
  virtualKeycode: number;
};

