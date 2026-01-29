import { GameStateService } from '../services/game-state.service';
import { HotkeysService } from '../services/hotkeys.service';
import { AppLaunchService } from '../services/app-launch.service';
import { MessageChannel, MessageType } from '../services/MessageChannel';
import { kHotkeys, kWindowNames } from '../../shared/consts';
import { createLogger } from '../../shared/services/Logger';
import { WindowsController } from './windows.controller';

const logger = createLogger('BackgroundController');

/**
 * BackgroundController orchestrates all background services.
 * It implements the Singleton pattern to ensure only one instance exists.
 * Uses dependency injection for services.
 */
export class BackgroundController {
  private static _instance: BackgroundController;

  private _messageChannel: MessageChannel;
  private _windowsController: WindowsController;
  private _gameStateService: GameStateService;
  private _hotkeysService: HotkeysService;
  private _appLaunchService: AppLaunchService;

  private _isGameRunning: boolean = false;

  private constructor() {
    // Initialize MessageChannel first (used by other services)
    this._messageChannel = new MessageChannel();
    this._hotkeysService = new HotkeysService();
    this._appLaunchService = new AppLaunchService(() => this.handleAppLaunch());
    this._gameStateService = new GameStateService(
      this._messageChannel,
      (isRunning, gameInfo) => this.handleGameStateChange(isRunning, gameInfo)
    );
    this._windowsController = new WindowsController(this._messageChannel);

    // Set up service callbacks
    this.setupHotkeyHandlers();
    this.setupMessageHandlers();
  }

  public static instance(): BackgroundController {
    if (!BackgroundController._instance) {
      BackgroundController._instance = new BackgroundController();
    }
    return BackgroundController._instance;
  }

  /**
   * Starts the background controller and initializes all services
   */
  public async run(): Promise<void> {
    // Determine which window to show based on game state
    const shouldShowInGame = await this._gameStateService.isSupportedGameRunning();
    if (shouldShowInGame) {
      await this._windowsController.onGameLaunch();
      this._isGameRunning = true;
    } else {
      // Change later to primary
      await this._windowsController.showMainDesktopWindow('secondary');
      this._isGameRunning = false;
    }
  }

  /**
   * Handles game state changes (game launched/terminated).
   */
  private async handleGameStateChange(isRunning: boolean, gameInfo?: overwolf.games.RunningGameInfo): Promise<void> {
    if (isRunning) {
      await this._windowsController.onGameLaunch();
      this._isGameRunning = true;
    } else {
      // Change later to primary
      await this._windowsController.showMainDesktopWindow('secondary');
      this._isGameRunning = false;
    }
  }

  /**
   * Sets up the hotkey handlers.
   */
  private setupHotkeyHandlers(): void {
    // Show/Hide Desktop Main Window
    this._hotkeysService.on(kHotkeys.toggleMainDesktopWindow, async () => {
      try {
        await this._windowsController.toggleMainDesktopWindow();
      } catch (error) {
        logger.error('Error toggling desktop main window:', error);
      }
    });

    // Show/Hide In-Game Main Window
    this._hotkeysService.on(kHotkeys.toggleMainIngameWindow, async () => {
      try {
        await this._windowsController.toggleMainIngameWindow();
      } catch (error) {
        logger.error('Error toggling in-game main window:', error);
      }
    });

  }

  /** 
   * Handles user-initiated app launches (clicking the app icon). 
   */
  private async handleAppLaunch(): Promise<void> {
    if (this._isGameRunning) {
      await this._windowsController.onGameLaunch();
    } else {
      // Change later to primary
      await this._windowsController.showMainDesktopWindow('secondary');
    }
  }

  /**
   * Sets up message handlers for window-related messages
   */
  private setupMessageHandlers(): void {
  }

}