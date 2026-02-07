// Game class IDs for supported games
export const kEndfieldClassId = 27724;

export const kWindowNames = {
  background: 'background',
  mainDesktop: 'main_desktop',
  mainIngame: 'main_ingame',
  rotationIngame: 'rotation_ingame',
  companionAppReady: 'companion_app_ready',
};

export const kHotkeys = {
  toggleMainIngameWindow: 'ToggleInGameMain',
  toggleMainDesktopWindow: 'ToggleDesktopMain',
  toggleRotationIngameWindow: 'ToggleInGameRotation',
};

export type HotkeyData = {
  name: string;
  title: string;
  binding: string;
  modifiers: overwolf.settings.hotkeys.HotkeyModifiers;
  virtualKeycode: number;
};

