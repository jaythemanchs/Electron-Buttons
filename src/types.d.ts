import { NativeImage, BrowserWindow } from "electron";
import { EventEmitter } from "node:events";

namespace electronButtons {
    namespace Main {
        class TitleBarButton extends EventEmitter {
            constructor(browserWindow: BrowserWindow, options: TitleBarButtonOptions) { }
            id: string
            buttonID: string
            height: number
            color: string
            colorOnHover: string
            colorOnClick: string
            attachedTo: BrowserWindow
            icon: NativeImage | string
            private _icon: NativeImage | string
            private _readableIcon: string

            /**
             * Occurs when the user clicks on the button.
             */
            on(event: 'click', listener: (event: MouseEvent) => void): this
            once(event: 'click', listener: (event: MouseEvent) => void): this
            addListener(event: 'click', listener: (event: MouseEvent) => void): this
            removeListener(event: 'click', listener: (event: MouseEvent) => void): this

            /**
             * Occurs when the user right-clicks on the button.
             */
            on(event: 'contextmenu', listener: (event: MouseEvent) => void): this
            once(event: 'contextmenu', listener: (event: MouseEvent) => void): this
            addListener(event: 'contextmenu', listener: (event: MouseEvent) => void): this
            removeListener(event: 'contextmenu', listener: (event: MouseEvent) => void): this

            /**
             * Occurs when the user double-clicks on the button.
             */
            on(event: 'dblclick', listener: (event: MouseEvent) => void): this
            once(event: 'dblclick', listener: (event: MouseEvent) => void): this
            addListener(event: 'dblclick', listener: (event: MouseEvent) => void): this
            removeListener(event: 'dblclick', listener: (event: MouseEvent) => void): this

            /**
             * Occurs when the user presses a mouse button over the button.
             */
            on(event: 'mousedown', listener: (event: MouseEvent) => void): this
            once(event: 'mousedown', listener: (event: MouseEvent) => void): this
            addListener(event: 'mousedown', listener: (event: MouseEvent) => void): this
            removeListener(event: 'mousedown', listener: (event: MouseEvent) => void): this

            /**
             * Occurs when the pointer is moved onto the button.
             */
            on(event: 'mouseenter', listener: (event: MouseEvent) => void): this
            once(event: 'mouseenter', listener: (event: MouseEvent) => void): this
            addListener(event: 'mouseenter', listener: (event: MouseEvent) => void): this
            removeListener(event: 'mouseenter', listener: (event: MouseEvent) => void): this

            /**
             * Occurs when the pointer is moved out of the button.
             */
            on(event: 'mouseleave', listener: (event: MouseEvent) => void): this
            once(event: 'mouseleave', listener: (event: MouseEvent) => void): this
            addListener(event: 'mouseleave', listener: (event: MouseEvent) => void): this
            removeListener(event: 'mouseleave', listener: (event: MouseEvent) => void): this

            /**
             * Occurs when the pointer is moving while it is over the button.
             */
            on(event: 'mouseout', listener: (event: MouseEvent) => void): this
            once(event: 'mouseout', listener: (event: MouseEvent) => void): this
            addListener(event: 'mouseout', listener: (event: MouseEvent) => void): this
            removeListener(event: 'mouseout', listener: (event: MouseEvent) => void): this

            /**
             * Occurs when the pointer is moving while it is over the button.
             */
            on(event: 'mouseover', listener: (event: MouseEvent) => void): this
            once(event: 'mouseover', listener: (event: MouseEvent) => void): this
            addListener(event: 'mouseover', listener: (event: MouseEvent) => void): this
            removeListener(event: 'mouseover', listener: (event: MouseEvent) => void): this

            /**
             * Occurs when a user releases a mouse button over the button.
             */
            on(event: 'mouseup', listener: (event: MouseEvent) => void): this
            once(event: 'mouseup', listener: (event: MouseEvent) => void): this
            addListener(event: 'mouseup', listener: (event: MouseEvent) => void): this
            removeListener(event: 'mouseup', listener: (event: MouseEvent) => void): this

            insertCSS: (buttonOrImage: 'button' | 'image', CSS: string) => Promise<string>
            removeCSS: (key: string) => Promise<void>
            static pixelsConsumed: (browserWindow: BrowserWindow) => { width: number, height: number }
        }
    }
    namespace Renderer {
        class TitleBarButton extends EventEmitter {
            constructor(options: TitleBarButtonOptions) { }
            id: string
            buttonID: string
            height: number
            color: string
            colorOnHover: string
            colorOnClick: string
            icon: NativeImage | string
            private _icon: NativeImage | string
            private _readableIcon: string

            /**
             * Occurs when the user clicks on the button.
             */
            on(event: 'click', listener: (event: MouseEvent) => void): this
            once(event: 'click', listener: (event: MouseEvent) => void): this
            addListener(event: 'click', listener: (event: MouseEvent) => void): this
            removeListener(event: 'click', listener: (event: MouseEvent) => void): this

            /**
             * Occurs when the user right-clicks on the button.
             */
            on(event: 'contextmenu', listener: (event: MouseEvent) => void): this
            once(event: 'contextmenu', listener: (event: MouseEvent) => void): this
            addListener(event: 'contextmenu', listener: (event: MouseEvent) => void): this
            removeListener(event: 'contextmenu', listener: (event: MouseEvent) => void): this

            /**
             * Occurs when the user double-clicks on the button.
             */
            on(event: 'dblclick', listener: (event: MouseEvent) => void): this
            once(event: 'dblclick', listener: (event: MouseEvent) => void): this
            addListener(event: 'dblclick', listener: (event: MouseEvent) => void): this
            removeListener(event: 'dblclick', listener: (event: MouseEvent) => void): this

            /**
             * Occurs when the user presses a mouse button over the button.
             */
            on(event: 'mousedown', listener: (event: MouseEvent) => void): this
            once(event: 'mousedown', listener: (event: MouseEvent) => void): this
            addListener(event: 'mousedown', listener: (event: MouseEvent) => void): this
            removeListener(event: 'mousedown', listener: (event: MouseEvent) => void): this

            /**
             * Occurs when the pointer is moved onto the button.
             */
            on(event: 'mouseenter', listener: (event: MouseEvent) => void): this
            once(event: 'mouseenter', listener: (event: MouseEvent) => void): this
            addListener(event: 'mouseenter', listener: (event: MouseEvent) => void): this
            removeListener(event: 'mouseenter', listener: (event: MouseEvent) => void): this

            /**
             * Occurs when the pointer is moved out of the button.
             */
            on(event: 'mouseleave', listener: (event: MouseEvent) => void): this
            once(event: 'mouseleave', listener: (event: MouseEvent) => void): this
            addListener(event: 'mouseleave', listener: (event: MouseEvent) => void): this
            removeListener(event: 'mouseleave', listener: (event: MouseEvent) => void): this

            /**
             * Occurs when the pointer is moving while it is over the button.
             */
            on(event: 'mouseout', listener: (event: MouseEvent) => void): this
            once(event: 'mouseout', listener: (event: MouseEvent) => void): this
            addListener(event: 'mouseout', listener: (event: MouseEvent) => void): this
            removeListener(event: 'mouseout', listener: (event: MouseEvent) => void): this

            /**
             * Occurs when the pointer is moving while it is over the button.
             */
            on(event: 'mouseover', listener: (event: MouseEvent) => void): this
            once(event: 'mouseover', listener: (event: MouseEvent) => void): this
            addListener(event: 'mouseover', listener: (event: MouseEvent) => void): this
            removeListener(event: 'mouseover', listener: (event: MouseEvent) => void): this

            /**
             * Occurs when a user releases a mouse button over the button.
             */
            on(event: 'mouseup', listener: (event: MouseEvent) => void): this
            once(event: 'mouseup', listener: (event: MouseEvent) => void): this
            addListener(event: 'mouseup', listener: (event: MouseEvent) => void): this
            removeListener(event: 'mouseup', listener: (event: MouseEvent) => void): this

            insertCSS: (buttonOrImage: 'button' | 'image', CSS: string) => Promise<string>
            removeCSS: (key: string) => Promise<void>
            static pixelsConsumed: () => { width: number, height: number }
        }
    }

    interface MouseEvent {
        isTrusted: boolean
        altKey: boolean
        button: number
        buttons: number
        clientX: number
        clientY: number
        ctrlKey: boolean
        layerX: number
        layerY: number
        metaKey: boolean
        movementX: number
        movementY: number
        offsetX: number
        offsetY: number
        pageX: number
        pageY: number
        screenX: number
        screenY: number
        shiftKey: boolean
        timeStamp: number
        type: MouseEventType
        which: number
        x: number
        y: number
    }

    type TitleBarButtonOptions = {
        buttonID?: string
        color: string
        colorOnClick?: string
        colorOnHover?: string
        height: number
        icon: NativeImage | string
        id: string
        show?: boolean
        tryToAnalyse?: boolean
    }

    type MouseEventType = 'click' | 'contextmenu' | 'dblclick' | 'mousedown' | 'mouseenter' | 'mouseleave' | 'mouseout' | 'mouseover' | 'mouseup'
}

export = {
    Main: electronButtons.Main,
    Renderer: electronButtons.Renderer
}

MouseEvent