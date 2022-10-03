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
                        this.attachedTo = browserWindow
                        this._id = options.id
                        this._buttonID = options.buttonID == undefined ? this._id : options.buttonID
                        this._height = options.height
                        this._icon = options.icon
                        this._show = options.show
                        this._readableIcon = typeof this.icon == 'string' ? nativeImage.createFromPath(this.icon).toDataURL() : this.icon.toDataURL()
                        attachReloadListener(this.attachedTo, this, options)
                        if (buttons.filter(button => button._id == options.id).length > 0) throw new Error('Buttons cannot share same ID!')
                        if (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(options.color) != null) {
                            this._color = options.color
                        } else {
                            throw new Error('Invalid HEX!')
                        }
                        if (options.tryToAnalyse == true) {
                            this._colorOnHover = color.getColorsFromColor(options.color).hexOnHover
                            this._colorOnClick = color.getColorsFromColor(options.color).hexOnClick
                        } else {
                            if (String(options.colorOnHover).length == 7 && typeof options.colorOnHover == 'string' && String(options.colorOnClick).length == 7 && typeof options.colorOnClick == 'string') {
                                this._colorOnHover = options.colorOnHover
                                this._colorOnClick = options.colorOnClick
                            } else {
                                throw new Error('Invalid Options object!')
                            }
                        }
                        if (typeof options.buttonID == 'string') this._buttonID = options.buttonID; else this._buttonID = options.id
                        if (buttons.filter(button => button._buttonID == this._buttonID).length > 0) throw new Error('Buttons cannot share same buttonID!')
                        buttons.push(this)
                        buttonCount++
                        this.attachedTo.webContents.executeJavaScriptInIsolatedWorld(0, [{ code: addElementScriptMain(this) }]).then(() => addEventListenersToTitleBarButton(this))
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
    _buttonID;
    get buttonID() {
        return this._buttonID;
    }
    set buttonID(value) {
        this.attachedTo.webContents.executeJavaScript(`document.getElementById('${this.buttonID}').id = '${value}'`)
        this._buttonID = value;
    }
    _height = 0;
    get height() {
        return this._height;
    }
    set height(value) {
        this.attachedTo.webContents.executeJavaScript(`document.getElementById('${this.buttonID}').style.height = '${value}px'; document.getElementById('${this.buttonID}').children[0].style.height = '${value}px'`)
        this._height = value;
    }
    _color = '';
    get color() {
        return this._color;
    }
    set color(value) {
        this.attachedTo.webContents.executeJavaScript(`document.getElementById('${this.buttonID}').id = '${value}'`)
        this._color = value;
    }
    colorOnHover = ''
    colorOnClick = ''
    attachedTo = null
    show = true
    _icon = null
    _readableIcon = ''
    processType = 'main'
    get icon() {
        return this._icon;
    }
    set icon(value) {
        if (typeof value == 'string') this._readableIcon = nativeImage.createFromPath(value).toDataURL(); else this._readableIcon = value.toDataURL()
        this._icon = value
        this.attachedTo.webContents.executeJavaScript(`
            document.getElementById('${this.buttonID}').src = '${this._readableIcon}'
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

class TitleBarButtonRenderer extends EventEmitter {
    constructor(options) {
        super()
        if (typeof options == 'object' && options != null) {
            if (templateOptionsRequired.every((option) => Object.keys(options).indexOf(option) > -1)) {
                this.id = options.id
                this.height = options.height
                this._icon = options.icon
                this.show = options.show
                this._readableIcon = typeof this.icon == 'string' ? nativeImage.createFromPath(this.icon).toDataURL() : this.icon.toDataURL()
                if (buttons.filter(button => button._id == options.id).length > 0) throw new Error('Buttons cannot share same ID!')
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
                let i = setInterval(() => {
                    if (typeof document != undefined && document != null) {
                        addElementScriptRenderer(this)
                        addEventListenersToTitleBarButton(this)
                        clearInterval(i)
                    }
                }, 10)
            } else {
                throw new Error('Invalid Options object!')
            }
        } else {
            throw new Error('Options must be specified!')
        }

    }
    id = ''
    buttonID = this.id
    height = 0
    color = ''
    colorOnHover = ''
    colorOnClick = ''
    hasBeenCreated = false
    show = true
    _icon = null
    _readableIcon = ''
    styleCount = 0
    processType = 'renderer'
    get icon() {
        return this._icon;
    }
    set icon(value) {
        if (typeof value == 'string') this._readableIcon = nativeImage.createFromPath(value).toDataURL(); else this._readableIcon = value.toDataURL()
        this._icon = value
        document.getElementById(this.buttonID).src = this._readableIcon
    }
    insertCSS = (buttonOrImage, CSS) => {
        return new Promise((resolve, reject) => {
            this.styleCount++
            document.head.insertAdjacentHTML("beforeend", `<style id="${this.styleCount}">
                #${buttonOrImage == 'btn' ? this.buttonID : this.buttonID + '>img'} {
                    ${CSS}
                }
            </style>`)
            resolve(this.styleCount)
        })
    }
    removeCSS = (key) => {
        return new Promise((resolve, reject) => {
            document.getElementById(key).remove()
            resolve()
        })
    }
    static pixelsConsumed = () => {
        return {
            width: (buttonCount * 46) + 138,
            height: Number(buttons[0].height)
        }
    }
}

function attachReloadListener(browserWindow, button) {
    let firstRun = true
    browserWindow.webContents.on('dom-ready', () => {
        if (!firstRun) {
            browserWindow.webContents.executeJavaScriptInIsolatedWorld(0, [{ code: addElementScriptMain(button) }]).then(() => addEventListenersToTitleBarButton(button))
                .catch((err) => {
                    throw new Error(err)
                })
        } else {
            firstRun = false
        }
    })
}

function addElementScriptMain(button) {
    return `
        const wrapper = document.createElement('div')
        const imgContainer = document.createElement('div')
        const img = document.createElement('img')

        wrapper.id = '${button.buttonID}'

        // Wrapper Style
        wrapper.style.width = '46px'
        wrapper.style.height = '${button.height}px'
        wrapper.style.position = 'absolute'
        wrapper.style.display = '${button.show == true ? 'flex' : 'none'}'
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
        wrapper.style.right = '${TitleBarButtonMain.pixelsConsumed(button.attachedTo).width - 46}px'

        // ImgContainer Style
        imgContainer.style.width = '46px'
        imgContainer.style.height = '${button.height}px'
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
        img.src = '${button._readableIcon}'

        imgContainer.append(img)
        wrapper.append(imgContainer)
        document.body.append(wrapper)

        // Wrapper Listeners
        wrapper.getElementsByTagName('div')[0].addEventListener('mousedown', async () => {
            wrapper.getElementsByTagName('div')[0].style.backgroundColor = '${button.colorOnClick}'
            wrapper.style.backgroundColor = ''
            wrapper.onmouseover = null
            wrapper.onmouseleave = null
            wrapper.getElementsByTagName('div')[0].onmouseenter = () => {
                wrapper.getElementsByTagName('div')[0].style.backgroundColor = '${button.colorOnClick}'
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

function addElementScriptRenderer(button) {
    const wrapper = document.createElement('div')
    const imgContainer = document.createElement('div')
    const img = document.createElement('img')

    wrapper.id = button.buttonID

    // Wrapper Style
    wrapper.style.width = '46px'
    wrapper.style.height = button.height + 'px'
    wrapper.style.position = 'absolute'
    wrapper.style.display = button.show == true ? 'flex' : 'none'
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
    wrapper.style.right = (TitleBarButtonRenderer.pixelsConsumed().width - 46) + 'px' 

    // ImgContainer Style
    imgContainer.style.width = '46px'
    imgContainer.style.height = button.height + 'px'
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
    img.src = button._readableIcon

    imgContainer.append(img)
    wrapper.append(imgContainer)
    document.body.append(wrapper)

    // Wrapper Listeners
    wrapper.getElementsByTagName('div')[0].addEventListener('mousedown', async () => {
        wrapper.getElementsByTagName('div')[0].style.backgroundColor = button.colorOnClick
        wrapper.style.backgroundColor = ''
        wrapper.onmouseover = null
        wrapper.onmouseleave = null
        wrapper.getElementsByTagName('div')[0].onmouseenter = () => {
            wrapper.getElementsByTagName('div')[0].style.backgroundColor = button.colorOnClick
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
}

function addEventListenerScriptMain(eventType, buttonID) {
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

function addEventListenerScriptRenderer(eventType, button) {
    var buttonElem = document.getElementById(button.buttonID)
    buttonElem.addEventListener(eventType, (event) => {
        button.emit(eventType, event)
    })
}

function removeEventListenerScriptMain(eventType, buttonID) {
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
    if (button.processType == 'main') {
        button.attachedTo.webContents.executeJavaScript(addEventListenerScriptMain(eventType, button.buttonID))
            .then((event) => {
                button.emit(eventType, event)
                button.attachedTo.webContents.executeJavaScript(removeEventListenerScriptMain(eventType, button.buttonID)).catch((err) => { throw new Error(err) })
                addEventListenerOfType(eventType, button)
            })
            .catch((err) => {
                if (err['screenX'] != undefined) {
                    button.emit(eventType, err)
                    button.attachedTo.webContents.executeJavaScript(removeEventListenerScriptMain(eventType, button.buttonID)).catch((err) => { throw new Error(err) })
                    addEventListenerOfType(eventType, button)
                }
            })
    } else {
        addEventListenerScriptRenderer(eventType, button)
    }
}

module.exports

module.exports.Main = {
    TitleBarButton: TitleBarButtonMain
}
module.exports.Renderer = {
    TitleBarButton: TitleBarButtonRenderer
}