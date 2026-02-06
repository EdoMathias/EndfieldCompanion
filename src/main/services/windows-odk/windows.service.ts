import { DesktopWindow, OSRWindow, WindowBase, Windows } from "@overwolf/odk-ts";
import { createLogger } from "../../../shared/services/Logger";
import { Edge } from "@overwolf/odk-ts/window/enums/edge";
import { MonitorsService } from "./monitors.service";
import { OSRType } from "@overwolf/odk-ts/window/enums/osr_window_type";
import { OSRWindowOptions } from "@overwolf/odk-ts/window/options/osr_window_options";
import { DesktopWindowOptions } from "@overwolf/odk-ts/window/options/desktop_window_options";

const logger = createLogger('WindowsManagerService');

type WindowTypes = DesktopWindow | OSRWindow;

const windowsConfigs: Record<string, OSRWindowOptions | DesktopWindowOptions> = {
    'main_desktop': {
        id: 'main_desktop',
        url: 'main_desktop.html',
        width: 1600,
        minWidth: 1600,
        height: 800,
        minHeight: 800,
        resizable: true,
        autoDpi: true
    },
    'main_ingame': {
        id: 'main_ingame',
        url: 'main_ingame.html',
        width: 1600,
        height: 800,
        minWidth: 1600,
        minHeight: 800,
        type: OSRType.InGameOnly,
        topMost: true,
        takeOverAction: 'ReleaseOnHidden',
        takeOverReleaseHotkey: 'ToggleInGameMain',
        resizable: true,
        showMaximize: true,
        autoDpi: true
    },
    'rotation_ingame': {
        id: 'rotation_ingame',
        url: 'rotation_ingame.html',
        width: 1600,
        height: 400,
        minWidth: 1600,
        minHeight: 400,
        type: OSRType.InGameOnly,
        resizable: false,
        transparent: true,
        keepWindowLocation: true,
        autoDpi: true
    }
}

export class WindowsService {
    private _mainDesktopWindow: DesktopWindow | undefined;
    private _mainIngameWindow: OSRWindow | undefined;
    private _rotationIngameWindow: OSRWindow | undefined;

    private _monitorsService: MonitorsService;

    constructor() {
        this._monitorsService = new MonitorsService();
    }

    //--------------------------------------------------------------------------
    // Windows getter
    public async getWindowById(windowId: string): Promise<WindowBase | undefined> {
        try {
            const window = await Windows.FromId(windowId);
            if (window) {
                return window;
            } else {
                return undefined;
            }
        } catch (error) {
            logger.error('Error getting window by id:', error);
            return undefined;
        }
    }

    //--------------------------------------------------------------------------
    // Main Desktop Window
    public async createMainDesktopWindow(): Promise<void> {
        if (this._mainDesktopWindow && await this._mainDesktopWindow.isOpen()) {
            return;
        } else {
            this._mainDesktopWindow = new DesktopWindow(windowsConfigs['main_desktop']);
            logger.log('Main desktop window created');
        }
    }

    public async showMainDesktopWindow(centerOnMonitor?: 'primary' | 'secondary', dockTo?: Edge): Promise<void> {
        if (!this._mainDesktopWindow || !(await this._mainDesktopWindow.isOpen())) {
            await this.createMainDesktopWindow();
        }

        await this.showWindow(this._mainDesktopWindow, centerOnMonitor, dockTo);
    }

    public async closeMainDesktopWindow(): Promise<void> {
        await this.closeWindow(this._mainDesktopWindow);
    }

    public async toggleMainDesktopWindow(): Promise<void> {
        await this.toggleWindow(this._mainDesktopWindow, true);
    }

    //--------------------------------------------------------------------------
    // Main Ingame Window
    public async createMainIngameWindow(): Promise<void> {
        if (this._mainIngameWindow && await this._mainIngameWindow.isOpen()) {
            return;
        } else {
            this._mainIngameWindow = new OSRWindow(windowsConfigs['main_ingame']);
            logger.log('Main in-game window created');
        }
    }

    public async showMainIngameWindow(centerOnMonitor?: 'primary' | 'secondary', dockTo?: Edge): Promise<void> {
        if (!this._mainIngameWindow || !(await this._mainIngameWindow.isOpen())) {
            await this.createMainIngameWindow();
        }

        await this.showWindow(this._mainIngameWindow, centerOnMonitor, dockTo);
    }

    public async closeMainIngameWindow(): Promise<void> {
        await this.closeWindow(this._mainIngameWindow);
    }

    public async toggleMainIngameWindow(): Promise<void> {
        await this.toggleWindow(this._mainIngameWindow, true);
    }
    //--------------------------------------------------------------------------
    // Rotation Ingame Window
    public async createRotationIngameWindow(): Promise<void> {
        if (this._rotationIngameWindow && await this._rotationIngameWindow.isOpen()) {
            return;
        } else {
            this._rotationIngameWindow = new OSRWindow(windowsConfigs['rotation_ingame']);
            logger.log('Rotation in-game window created');
        }
    }

    public async showRotationIngameWindow(centerOnMonitor?: 'primary' | 'secondary', dockTo?: Edge): Promise<void> {
        if (!this._rotationIngameWindow || !(await this._rotationIngameWindow.isOpen())) {
            await this.createRotationIngameWindow();
        }

        await this.showWindow(this._rotationIngameWindow, centerOnMonitor, dockTo);
    }

    public async closeRotationIngameWindow(): Promise<void> {
        await this.closeWindow(this._rotationIngameWindow);
    }

    public async toggleRotationIngameWindow(): Promise<void> {
        await this.toggleWindow(this._rotationIngameWindow, false);
    }

    //--------------------------------------------------------------------------
    /**
     * Shows a window
     * @param window - The window to show
     * @param centerOnMonitor - The monitor to center the window on
     * @param dockTo - The edge to dock the window to
     */
    private async showWindow(window: WindowTypes, centerOnMonitor?: 'primary' | 'secondary', dockTo?: Edge): Promise<void> {
        try {
            // Show needs to be called before centerOnMonitor and dockTo to work
            const result = await window.show();
            if (result === true) {
                logger.log(`Window ${window.Id()} shown`);
            }

            if (centerOnMonitor) {
                const monitor = centerOnMonitor === 'primary' ? this._monitorsService.getPrimaryMonitor() : this._monitorsService.getSecondMonitor();
                if (monitor) {
                    await window.centerOnMonitor({ left: monitor.x, top: monitor.y, width: monitor.width, height: monitor.height });
                    logger.log(`Window ${window.Id()} centered on monitor ${monitor.id}`);
                }
            }
            if (dockTo) {
                await window.dock(dockTo);
                logger.log(`Window ${window.Id()} docked to ${dockTo}`);
            }

            await window.restore();
            await window.bringToFront();
            logger.log(`Window ${window.Id()} brought to front`);
        } catch (error) {
            logger.error('Error showing window:', error);
        }
    }

    private async closeWindow(window: WindowTypes): Promise<void> {
        if (!window || (await window.isOpen()) === false) {
            logger.error('Window might not be open, skipping close');
            return;
        }

        try {
            const windowId = window.Id();
            await window.close();
            logger.log(`Window ${windowId} closed`);
        } catch (error) {
            logger.error('Error closing window:', error);
        }
    }

    private async toggleWindow(window: WindowTypes, center?: boolean): Promise<void> {
        if (window) {
            const windowState = await window.getWindowState();
            const isVisible = windowState === overwolf.windows.WindowStateEx.NORMAL ||
                windowState === overwolf.windows.WindowStateEx.MAXIMIZED;

            if (isVisible) {
                await window.hide();
                logger.log('Hiding window by hotkey');
            } else {
                await window.restore();
                await window.bringToFront();

                if (center) {
                    await window.center();
                }
                logger.log('Showing window by hotkey');
            }
        }
    }
}