const color = require('./color')
const { EventEmitter } = require('node:events');
const crypto = require('node:crypto')
const { ipcMain, nativeImage } = require('electron')
let buttonCount = 0
let buttons = []
const templateOptionsRequired = ['id', 'height', 'icon', 'color', 'show']
const templateOptionsOptional = ['tryToAnalyse', 'colorOnHover', 'colorOnClick', 'buttonID']

class TitleBarButton extends EventEmitter {
    constructor(browserWindow, options) {
        super()
        if (browserWindow != null && browserWindow != undefined) {
            if (browserWindow['webContents'] != undefined) {
                if (typeof options == 'object' && options != null) {
                    if (templateOptionsRequired.every((option) => Object.keys(options).indexOf(option) > -1)) {
                        this.id = options.id
                        this.height = options.height
                        this._icon = options.icon
                        this.attachedTo = browserWindow
                        this._readableIcon = typeof this.icon == 'string' ? nativeImage.createFromPath(this.icon).toDataURL() : this.icon.toDataURL()
                        if (buttons.filter(button => button.id == options.id).length > 0) throw new Error('Buttons cannot share same ID!')
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
                        if (buttons.filter(button => button.buttonID == this.buttonID).length > 0) throw new Error('Buttons cannot share same buttonID!')
                        buttons.push(this)
                        buttonCount++
                        console.log(this.height + 'px')
                        this.attachedTo.webContents.executeJavaScriptInIsolatedWorld(0, [{code: `
                            const wrapper = document.createElement('div')
                            const imgContainer = document.createElement('div')
                            const img = document.createElement('img')

                            // Wrapper Style
                            wrapper.style.width = '46px'
                            wrapper.style.height = '${this.height}px'
                            wrapper.style.position = 'absolute'
                            wrapper.style.display = '${options.show == true ? 'flex' : 'none'}'
                            wrapper.style.justifyContent = 'center'
                            wrapper.style.alignItems = 'center'
                            wrapper.style.flexGrow = 0
                            wrapper.style.flexShrink = 0
                            wrapper.style.textAlign = 'center'
                            wrapper.style.zIndex = 3000
                            wrapper.style.appRegion = 'no-drag'
                            wrapper.style.zoom = 'calc(1/var(--zoom-factor))'
                            wrapper.style.transition = '150ms background-color'
                            wrapper.style.top = 0

                            // ImgContainer Style
                            imgContainer.style.width = '46px'
                            imgContainer.style.height = '${this.height}px'
                            imgContainer.style.display = 'flex';
                            imgContainer.style.flexDirection = 'column';
                            imgContainer.style.alignItems = 'center';
                            imgContainer.style.justifyContent = 'center';
                            imgContainer.style.transition = 'none';

                            // Img Style
                            img.style.width = '30px'
                            img.style.height = '30px'
                            img.style.margin = 'auto';
                            img.style.userSelect = 'none !important';
                            img.style.userSelect = 'none !important';
                            img.style.userDrag = 'none';
                            img.src = '${this._readableIcon}'

                            imgContainer.append(img)
                            wrapper.append(imgContainer)
                            document.body.append(wrapper)
                        `}]).then()
                        .catch((err) => {
                            console.error(err)
                        })
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
    _icon = null
    _readableIcon = ''
    get icon() {
        return this._icon;
    }
    set icon(value) {
        if (typeof value == 'string') this._readableIcon = nativeImage.createFromPath(value).toDataURL(); else this._readableIcon = value.toDataURL()
        this._icon = value;
    }
    insertCSS = (buttonOrImage, CSS) => {
        return new Promise((resolve, reject) => {
            this.attachedTo.webContents.insertCSS(`
                ${buttonOrImage == 'btn' ? this.buttonID : this.buttonID + '>img'} {
                    ${CSS}
                }
            `).then(key => {
                resolve(key)
            }).catch(err => {
                reject(err)
            })
        })
    }
    removeCSS = (key) => {
        return new Promise((resolve, reject) => {
            this.attachedTo.webContents.removeInsertedCSS(key).then(() => {
                resolve()
            })
                .catch(err => {
                    reject(err)
                })
        })
    }
    static pixelsConsumed = (browserWindow) => {
        return {
            width: (buttonCount * 46) + 138,
            height: Number(buttons.filter((button) => button.attachedTo == browserWindow)[0].height)
        }
    }
}

module.exports = { TitleBarButton }