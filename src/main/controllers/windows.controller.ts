import { kWindowNames } from '../../shared/consts';
import { MessageChannel, MessageType } from '../services/MessageChannel';
import { createLogger } from '../../shared/services/Logger';
import { MonitorInfo, MonitorsService } from '../services/windows-odk/monitors.service';
import { WindowsService } from '../services/windows-odk/windows.service';
import { Edge } from '@overwolf/odk-ts/window/enums/edge';

const logger = createLogger('WindowsController');

export class WindowsController {
    private _messageChannel: MessageChannel;
    private _windowsService: WindowsService;
    private _monitorsService: MonitorsService;

    constructor(messageChannel: MessageChannel) {
        this._messageChannel = messageChannel;
        this._monitorsService = new MonitorsService();
        this._windowsService = new WindowsService();
    }

    public async onGameLaunch(): Promise<void> {
        // Ensure the monitors map is ready - fixes a bug where the map was not ready,
        // and users with a second monitor would not see the main desktop window.
        await this._monitorsService.ensureMonitorsMapReady();

        // if has second monitor, show the main desktop window on the second monitor
        if (this._monitorsService.hasSecondMonitor()) {
            await this._windowsService.showMainDesktopWindow('secondary');
            logger.log('Moving main desktop window to secondary monitor');
        }

        // Create the main in-game window but don't show it yet
        await this._windowsService.createMainIngameWindow();
    }

    public async onGameExit(): Promise<void> {
        // Close the main in-game window
        await this._windowsService.closeMainIngameWindow();

        // Move the main desktop window to the center of the main monitor
        await this._windowsService.showMainDesktopWindow('primary');
    }

    public async showMainDesktopWindow(centerOnMonitor?: 'primary' | 'secondary', dockTo?: Edge): Promise<void> {
        await this._windowsService.showMainDesktopWindow(centerOnMonitor, dockTo);
    }

    public async showMainIngameWindow(centerOnMonitor?: 'primary' | 'secondary', dockTo?: Edge): Promise<void> {
        await this._windowsService.showMainIngameWindow(centerOnMonitor, dockTo);
    }

    public async toggleMainDesktopWindow(): Promise<void> {
        await this._windowsService.toggleMainDesktopWindow();
    }

    public async toggleMainIngameWindow(): Promise<void> {
        await this._windowsService.toggleMainIngameWindow();
    }

    public async closeAllWindows(): Promise<void> {
        try {
        await this._windowsService.closeMainDesktopWindow();
        } catch (error) {
            logger.error('Error closing main desktop window:', error);
        }
        try {
        await this._windowsService.closeMainIngameWindow();
        } catch (error) {
            logger.error('Error closing main in-game window:', error);
        }
    }
}

