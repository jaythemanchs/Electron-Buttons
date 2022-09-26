export class TitleBarButton extends EventEmitter {
    constructor(browserWindow: BrowserWindow, options: TitleBarButtonOptions) {
        super()
    }
    id: string
    buttonID: string
    height: number
    color: string
    colorOnHover: string
    colorOnClick: string
    attachedTo: BrowserWindow
    icon: NativeImage | string
    private _icon: NativeImage | string;
    private _readableIcon: string;
    private readonly internalPort: string
    insertCSS: (buttonOrImage: 'button' | 'image') => Promise<string>
    removeCSS: (key: string) => Promise<void>
    static pixelsConsumed: (browserWindow: BrowserWindow) => { width: number, height: number }
}

type TitleBarButtonOptions = {
    buttonID?: string
    color: string
    colorOnClick?: string
    colorOnHover?: string
    height: number
    icon: NativeImage | string
    id: string
    tryToAnalyse?: boolean
}