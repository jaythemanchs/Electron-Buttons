let buttonCount = 0
let buttons = []

class TitleBarButton {
    constructor(browserWindow, options) {
        if (browserWindow != null && browserWindow != undefined) {
            if (browserWindow['webContents'] != undefined) {
                if (typeof options == 'object' && options != null)
                buttonCount++
                this.id = buttonCount
            } else {
                throw new Error('BrowserWindow must be of type \'BrowserWindow\'')
            }
        } else {
            throw new Error('BrowserWindow must be of type \'BrowserWindow\'')
        }
    }
    id = 0
    static getPropertiesOfWindow = () => {

    }
    static pixelsConsumed = (browserWindow) => {
        return {
            width: (buttonCount * 46),
            height: 0
        }
    }
}

new TitleBarButton(null)