const color = require('./color')
const { EventEmitter } = require('node:events');
const { ipcMain, nativeImage } = require('electron')
let buttonCount = 0
let buttons = []
const templateOptionsRequired = ['id', 'height', 'icon', 'color', 'show']
const templateOptionsOptional = ['tryToAnalyse', 'colorOnHover', 'colorOnClick', 'buttonID']
const eventTypes = [
    'click',
    'contextmenu',
    'dblclick',
    'mousedown',
    'mouseenter',
    'mouseleave',
    'mouseout',
    'mouseover',
    'mouseup'
]

class TitleBarButtonMain extends EventEmitter {
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
                        this.show = options.show
                        this._readableIcon = typeof this.icon == 'string' ? nativeImage.createFromPath(this.icon).toDataURL() : this.icon.toDataURL()
                        attachReloadListener(this.attachedTo, this, options)
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
                        this.attachedTo.webContents.executeJavaScriptInIsolatedWorld(0, [{ code: addElementScript(this) }]).then(() => addEventListenersToTitleBarButton(this))
                            .catch((err) => {
                                throw new Error(err)
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
    show = true
    _icon = null
    _readableIcon = ''
    get icon() {
        return this._icon;
    }
    set icon(value) {
        if (typeof value == 'string') this._readableIcon = nativeImage.createFromPath(value).toDataURL(); else this._readableIcon = value.toDataURL()
        this._icon = value
        this.attachedTo.webContents.executeJavaScript(`
            document.getElementById('${thus.buttonID}').src = '${this._readableIcon}'
        `)
    }
    insertCSS = (buttonOrImage, CSS) => {
        return new Promise((resolve, reject) => {
            this.attachedTo.webContents.insertCSS(`
                #${buttonOrImage == 'btn' ? this.buttonID : this.buttonID + '>img'} {
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

function attachReloadListener(browserWindow, button) {
    let firstRun = true
    browserWindow.webContents.on('dom-ready', () => {
        if (!firstRun) {
            browserWindow.webContents.executeJavaScriptInIsolatedWorld(0, [{ code: addElementScript(button) }]).then(() => addEventListenersToTitleBarButton(button))
                .catch((err) => {
                    throw new Error(err)
                })
        } else {
            firstRun = false
        }
    })
}

function addElementScript(classObject) {
    return `
        const wrapper = document.createElement('div')
        const imgContainer = document.createElement('div')
        const img = document.createElement('img')

        wrapper.id = '${classObject.buttonID}'

        // Wrapper Style
        wrapper.style.width = '46px'
        wrapper.style.height = '${classObject.height}px'
        wrapper.style.position = 'absolute'
        wrapper.style.display = '${classObject.show == true ? 'flex' : 'none'}'
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
        wrapper.style.right = '${TitleBarButtonMain.pixelsConsumed(classObject.attachedTo).width - 46}px'

        // ImgContainer Style
        imgContainer.style.width = '46px'
        imgContainer.style.height = '${classObject.height}px'
        imgContainer.style.display = 'flex';
        imgContainer.style.flexDirection = 'column';
        imgContainer.style.alignItems = 'center';
        imgContainer.style.justifyContent = 'center';
        imgContainer.style.transition = 'none';

        // Img Style
        img.style.width = '30px'
        img.style.height = '30px'
        img.style.margin = 'auto';
        img.style['-webkit-user-select'] = 'none';
        img.style['-webkit-user-drag'] = 'none';
        img.src = '${classObject._readableIcon}'

        imgContainer.append(img)
        wrapper.append(imgContainer)
        document.body.append(wrapper)

        // Wrapper Listeners
        wrapper.getElementsByTagName('div')[0].addEventListener('mousedown', async () => {
            wrapper.getElementsByTagName('div')[0].style.backgroundColor = '#bdbdbd'
            wrapper.style.backgroundColor = ''
            wrapper.onmouseover = null
            wrapper.onmouseleave = null
            wrapper.getElementsByTagName('div')[0].onmouseenter = () => {
                wrapper.getElementsByTagName('div')[0].style.backgroundColor = '#bdbdbd'
            }
        })
    
        document.addEventListener('mouseup', () => {
            wrapper.getElementsByTagName('div')[0].style.backgroundColor = ''
            wrapper.getElementsByTagName('div')[0].onmouseenter = null
            wrapper.onmouseover = async () => {
                wrapper.style.backgroundColor = await hasFocus() ? '#ddd' : '#d0d0d0'
            }
            wrapper.onmouseleave = () => {
                wrapper.style.backgroundColor = ''
            }
            if (wrapper.hasAttribute('mouseover')) {
                wrapper.classList.add('noTrans')
                wrapper.style.backgroundColor = '#ddd'
                setTimeout(() => {
                    wrapper.classList.remove('noTrans')
                }, 1)
            }
        })
    
        wrapper.getElementsByTagName('div')[0].addEventListener('mouseleave', () => {
            wrapper.getElementsByTagName('div')[0].style.backgroundColor = ''
        })
    
        wrapper.onmouseover = async () => {
            wrapper.style.backgroundColor = await hasFocus() ? '#dddddd' : '#d0d0d0'
        }
    
        wrapper.onmouseleave = () => {
            wrapper.style.backgroundColor = ''
        }
    
        wrapper.addEventListener('mouseover', () => {
            wrapper.setAttribute('mouseover', '')
        })
    
        wrapper.addEventListener('mouseleave', () => {
            wrapper.removeAttribute('mouseover')
        })

        async function hasFocus() {
            return true
        }

        null
    `;
}

function addEventListenerScript(eventType, buttonID) {
    return `
        var button = document.getElementById('${buttonID}')

        var eventPromise = new Promise((reject, resolve) => {
            button.addEventListener('${eventType}', (event) => {
                let eventParams = [
                    "isTrusted",
                    "altKey",
                    "button",
                    "buttons",
                    "clientX",
                    "clientY",
                    "ctrlKey",
                    "layerX",
                    "layerY",
                    "metaKey",
                    "movementX",
                    "movementY",
                    "offsetX",
                    "offsetY",
                    "pageX",
                    "pageY",
                    "screenX",
                    "screenY",
                    "shiftKey",
                    "timeStamp",
                    "type",
                    "which",
                    "x",
                    "y"
                ]
                let clonableEvent = {}

                eventParams.forEach((eventParam) => {
                    clonableEvent[eventParam] = event[eventParam]
                })

                resolve(clonableEvent)
            })
        })

        eventPromise
    `
}

function removeEventListenerScript(eventType, buttonID) {
    return `
        var button = document.getElementById('${buttonID}')
        button.removeEventListener('${eventType}', (event) => {
            let eventParams = [
                "isTrusted",
                "altKey",
                "button",
                "buttons",
                "clientX",
                "clientY",
                "ctrlKey",
                "layerX",
                "layerY",
                "metaKey",
                "movementX",
                "movementY",
                "offsetX",
                "offsetY",
                "pageX",
                "pageY",
                "screenX",
                "screenY",
                "shiftKey",
                "timeStamp",
                "type",
                "which",
                "x",
                "y"
            ]
            let clonableEvent = {}

            eventParams.forEach((eventParam) => {
                clonableEvent[eventParam] = event[eventParam]
            })

            resolve(clonableEvent)
        })

        delete eventPromise
    `
}

function addEventListenersToTitleBarButton(button) {
    eventTypes.forEach(eventType => {
        addEventListenerOfType(eventType, button)
    })
}

function addEventListenerOfType(eventType, button) {
    button.attachedTo.webContents.executeJavaScript(addEventListenerScript(eventType, button.buttonID))
        .then((event) => {
            button.emit(eventType, event)
            button.attachedTo.webContents.executeJavaScript(removeEventListenerScript(eventType, button.buttonID)).catch((err) => { throw new Error(err) })
            addEventListenerOfType(eventType, button)
        })
        .catch((err) => {
            if (err['screenX'] != undefined) {
                button.emit(eventType, err)
                button.attachedTo.webContents.executeJavaScript(removeEventListenerScript(eventType, button.buttonID)).catch((err) => { throw new Error(err) })
                addEventListenerOfType(eventType, button)
            }
        })
}

class TitleBarButtonRenderer { }

module.exports

module.exports.Main = {
    TitleBarButton: TitleBarButtonMain
}
module.exports.Renderer = {
    TitleBarButton: TitleBarButtonRenderer
}