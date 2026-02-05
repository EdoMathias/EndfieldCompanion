import { GameStateService } from '../services/game-state.service';
import { HotkeysService } from '../services/hotkeys.service';
import { AppLaunchService } from '../services/app-launch.service';
import { MessageChannel, MessageType } from '../services/MessageChannel';
import { kEndfieldClassId, kHotkeys, kWindowNames } from '../../shared/consts';
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
      logger.log('Game is Endfield, showing in-game window');
      await this._windowsController.onGameLaunch();
      this._isGameRunning = true;
    } else {
      logger.log('No game running, showing primary desktop window');
      await this._windowsController.showMainDesktopWindow('primary');
      this._isGameRunning = false;
    }
  }

  /**
   * Handles game state changes (game launched/terminated).
   */
  private async handleGameStateChange(isEndfieldRunning: boolean, gameInfo?: overwolf.games.RunningGameInfo): Promise<void> {
    if (isEndfieldRunning) {
      await this._windowsController.onGameLaunch();
      this._isGameRunning = true;
    } else {
      // If the game is Endfield, show the main desktop window
      if (gameInfo?.classId === kEndfieldClassId) {
        logger.log('Game was Endfield, showing main desktop window');
        await this._windowsController.onGameExit();
        this._isGameRunning = false;
      }
      // If the game is not Endfield, don't do anything
      else {
        logger.log('Game was not Endfield, not showing main desktop window');
        return;
      }
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
      logger.log('Game is running, showing in-game window');
      await this._windowsController.onGameLaunch();
    } else {
      logger.log('No game running, showing primary desktop window');
      await this._windowsController.showMainDesktopWindow('primary');
    }
  }

  /**
   * Sets up message handlers for window-related messages
   */
  private setupMessageHandlers(): void {
  }

}