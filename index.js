const color = require('./color')
const { EventEmitter } = require('node:events');
let buttonCount = 0
let buttons = []
const templateOptionsRequired = ['id', 'height', 'icon', 'color']
const templateOptionsOptional = ['tryToAnalyse', 'colorOnHover', 'colorOnClick', 'buttonID']

class TitleBarButton extends EventEmitter {
    constructor(browserWindow, options) {
        super ()
        if (browserWindow != null && browserWindow != undefined) {
            if (browserWindow['webContents'] != undefined) {
                if (typeof options == 'object' && options != null) {
                    if (templateOptionsRequired.every((option) => Object.keys(options).indexOf(option) > -1)) {
                        this.id = options.id
                        this.height = options.height
                        this.icon = options.icon
                        this.attachedTo = browserWindow
                        if (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(options.color) != null) {
                            this.color = options.color
                        } else {
                            throw new Error('Invalid HEX!')
                        }
                        if (options.tryToAnalyse == true) {
                            this.colorOnHover = color.getColorsFromColor(options.color).hexOnHover
                            this.colorOnClick = color.getColorsFromColor(options.color).hexOnClick
                        } else {
                            if (String(options.colorOnHover).length == 7 && typeof options.colorOnHover == 'string' && String(options.colorOnClick).length == 7 && typeof options.colorOnClick == 'string') {
                                this.colorOnHover = options.colorOnHover
                                this.colorOnClick = options.colorOnClick
                            } else {
                                throw new Error('Invalid Options object!')
                            }
                        }
                        if (typeof options.buttonID == 'string') this.buttonID = options.buttonID; else this.buttonID = options.id
                        buttons.push(this)
                    } else {
                        throw new Error('Invalid Options object!')
                    }
                } else {
                    throw new Error('Options must be specified!')
                }
            } else {
                throw new Error('BrowserWindow must be of type \'BrowserWindow\'')
            }
        } else {
            throw new Error('BrowserWindow must be of type \'BrowserWindow\'')
        }
    }
    id = ''
    buttonID = this.id
    height = 0
    color = ''
    colorOnHover = ''
    colorOnClick = ''
    hasBeenCreated = false
    attachedTo = null
    icon = null
    insertCSS = (buttonOrImg) => {
        if (this.hasBeenCreated) {
            this.attachedTo.webContents.insertCSS()
        } else {
            
        }
    }
    static pixelsConsumed = (browserWindow) => {
        return {
            width: (buttonCount * 46),
            height: Number(buttons.filter((button) => button.attachedTo == browserWindow)[0].height)
        }
    }
}

console.log(TitleBarButton)
console.log(new TitleBarButton({webContents: 0}, {id: 'l', height: 40, icon: '', color: '#ffffff', tryToAnalyse: true, buttonID: 'accountButton'}))