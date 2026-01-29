// Game class IDs for supported games
export const kEndfieldClassId = 27724;

export const kWindowNames = {
  background: 'background',
  mainDesktop: 'main_desktop',
  mainIngame: 'main_ingame',
};

export const kHotkeys = {
  toggleMainIngameWindow: 'Toggle In-Game Main',
  toggleMainDesktopWindow: 'Toggle Desktop Main',
};

export type HotkeyData = {
  name: string;
  title: string;
  binding: string;
  modifiers: overwolf.settings.hotkeys.HotkeyModifiers;
  virtualKeycode: number;
};

