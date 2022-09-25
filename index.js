let buttonCount = 0
let buttons = []
const templateOptions = ['id', 'height', 'icon', ]

class TitleBarButton {
    constructor(browserWindow, options) {
        if (browserWindow != null && browserWindow != undefined) {
            if (browserWindow['webContents'] != undefined) {
                if (typeof options == 'object' && options != null) {
                    if (Object.keys(options) == templateOptions) {
                        this.id = options.id
                    }
                }
            } else {
                throw new Error('BrowserWindow must be of type \'BrowserWindow\'')
            }
        } else {
            throw new Error('BrowserWindow must be of type \'BrowserWindow\'')
        }
    }
    id
    height
    static getPropertiesOfWindow = (browserWindow) => {

    }
    static pixelsConsumed = (browserWindow) => {
        return {
            width: (buttonCount * 46),
            height: this.getPropertiesOfWindow(browserWindow)
        }
    }
}

new TitleBarButton(null)