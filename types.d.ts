import { EventEmitter } from 'node:events';
import { BrowserWindow, NativeImage } from 'electron'

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
    private readonly hasBeenCreated: boolean
    attachedTo: BrowserWindow
    icon: NativeImage
    insertCSS: (buttonOrImg: 'button' | 'image') => void
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