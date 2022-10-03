const { desktopCapturer, screen, app, BrowserWindow, dialog, ipcMain } = require('electron')
const { watchFile, readFileSync } = require('fs')
let forceClose = false

app.on('ready', () => {
    const fileId = process.argv[2].substring(9)
    const path = require('path')
    const filePath = path.join(process.cwd(), fileId + '.txt')
    const currentScreen = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
    let statedReady = false

    watchFile(filePath, async (curr, prev) => {
        if (!statedReady) {
            console.log('ready')
            statedReady = true
        }
        const fileContents = readFileSync(filePath, { encoding: 'utf8' }).replace(/[^\x20-\x7E]+/g, '')
        const lastIndexOf = fileContents.lastIndexOf('\n') + 1
        const line = fileContents.substring(lastIndexOf)
        const object = JSON.parse(line)
        const keys = Object.keys(object)
        const key = keys.map(key => key.replace(/[^\x20-\x7E]+/g, ''))[0]
        switch (key) {
            case 'hex':
                const window = new BrowserWindow({
                    show: true,
                    backgroundColor: invertColor(object['hex'], true),
                    title: 'Electron-Buttons Color Helper',
                    frame: false,
                    titleBarStyle: 'hidden',
                    titleBarOverlay: {
                        color: object['hex'],
                        symbolColor: object['symbolHex'],
                        height: 600
                    },
                    webPreferences: {
                        preload: path.join(__dirname, 'preload.js'),
                        sandbox: false
                    }
                })

                window.loadFile(path.join(__dirname, 'index.html'))

                window.on('close', (event) => {
                    if (!forceClose) {
                        dialog.showMessageBox(window, {
                            message: 'Warning',
                            buttons: ['&Cancel', '&Ok'],
                            cancelId: 0,
                            defaultId: 0,
                            detail: 'You are about to exit the wizard.',
                            noLink: true,
                            normalizeAccessKeys: true,
                            title: 'Warning',
                            type: 'warning'
                        }).then((value) => {
                            if (value.response == 0) event.preventDefault()
                        })
                    }
                })

                window.on('minimize', () => {
                    setTimeout(() => {
                        window.focus()
                    }, 200)
                })

                window.once('ready-to-show', () => {
                    console.log('window_loaded')
                    window.maximize()
                    window.setTitleBarOverlay({
                        height: window.getSize()[1]
                    })
                    window.on('resize', () => {
                        window.setTitleBarOverlay({
                            height: window.getSize()[1]
                        })
                    })
                    window.on('unmaximize', () => {
                        window.setTitleBarOverlay({
                            height: window.getSize()[1]
                        })
                    })
                })

                window.on('ready-to-show', async () => {
                    window.setTitleBarOverlay({
                        height: window.getSize()[1]
                    })
                    startProcess()
                })

                ipcMain.on('color1', (event, r, g, b) => {
                    console.log('color1hex' + rgbToHex(r, g, b))
                    dialog.showMessageBox(window, {
                        title: 'Instructions',
                        type: 'info',
                        detail: 'Note: Do not close message until told to.\nStep 1: Place your mouse over the bottom of the Minimize Button.\nStep 2: Hold down the left mouse button.\nStep 3: Press enter to close the dialog and wait for further instructions.',
                        message: 'Instructions'
                    }).then(() => {
                        setTimeout(async () => {
                            const sources = await desktopCapturer.getSources({
                                types: ['screen'],
                                thumbnailSize: { width: (currentScreen.size.width * currentScreen.scaleFactor), height: (currentScreen.size.height * currentScreen.scaleFactor) }
                            })
                            const image = sources.filter((source) => source.display_id == currentScreen.id)[0].thumbnail
                            window.webContents.send('canvas', currentScreen.scaleFactor, image.toDataURL())
                        }, 1000)
                    })
                })

                ipcMain.on('color2', (event, r, g, b) => {
                    console.log('color2hex' + rgbToHex(r, g, b))
                    forceClose = true
                    window.close()
                    console.log('completed')
                })

                async function startProcess() {
                    dialog.showMessageBox(window, {
                        title: 'Instructions',
                        type: 'info',
                        detail: 'Note: Do not close message until told to.\nStep 1: Place your mouse over the bottom of the Minimize Button.\nStep 2: Continue to slightly move the cursor in its place.\nStep 3: Press enter to close the dialog and wait for further instructions.',
                        message: 'Instructions'
                    }).then(() => {
                        setTimeout(async () => {
                            const sources = await desktopCapturer.getSources({
                                types: ['screen'],
                                thumbnailSize: { width: (currentScreen.size.width * currentScreen.scaleFactor), height: (currentScreen.size.height * currentScreen.scaleFactor) }
                            })
                            const image = sources.filter((source) => source.display_id == currentScreen.id)[0].thumbnail
                            window.webContents.send('canvas', currentScreen.scaleFactor, image.toDataURL())
                        }, 1000)
                    })
                }
                break
        }
    })

    function invertColor(hex, bw) {
        if (hex.indexOf('#') === 0) {
            hex = hex.slice(1);
        }
        // convert 3-digit hex to 6-digits.
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) {
            throw new Error('Invalid HEX color.');
        }
        var r = parseInt(hex.slice(0, 2), 16),
            g = parseInt(hex.slice(2, 4), 16),
            b = parseInt(hex.slice(4, 6), 16);
        if (bw) {
            // https://stackoverflow.com/a/3943023/112731
            return (r * 0.299 + g * 0.587 + b * 0.114) > 186
                ? '#000000'
                : '#FFFFFF';
        }
        // invert color components
        r = (255 - r).toString(16);
        g = (255 - g).toString(16);
        b = (255 - b).toString(16);
        // pad each with zeros and return
        return "#" + padZero(r) + padZero(g) + padZero(b);
    }

    function padZero(str, len) {
        len = len || 2;
        var zeros = new Array(len).join('0');
        return (zeros + str).slice(-len);
    }

    function rgbToHex(r, g, b) {
        if (r > 255 || g > 255 || b > 255)
            throw "Invalid color component";
        return ((r << 16) | (g << 8) | b).toString(16);
    }
})