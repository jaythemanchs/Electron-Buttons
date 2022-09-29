const { BrowserWindow, app, Menu, ipcMain, dialog } = require('electron')
const { TitleBarButton } = require('electron-buttons').Main
const path = require('path')
const events = []
let pID = 0

app.on('ready', () => {
    createWindow()
})

function createWindow() {
    const window = new BrowserWindow({
        width: 606,
        height: 500,
        frame: false,
        show: false,
        titleBarOverlay: {
            height: 40,
            color: '#ffffff',
            symbolColor: 'black'
        },
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    const titleBarButton = new TitleBarButton(window, {
        id: 'button1',
        height: 40,
        icon: path.join(__dirname, 'images/electron-logo.png'),
        color: '#ffffff',
        tryToAnalyse: true,
        buttonID: 'titleBarButton',
        show: true
    })

    Array.from(['click', 'contextmenu', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mouseout', 'mouseover', 'mouseup']).forEach((eventName) => {
        titleBarButton.on(eventName, (event) => {
            pID++
            events.push(event)
            window.webContents.executeJavaScript(`
                var p = document.getElementById('log').getElementsByTagName('p')[0]
                p.innerHTML += \`<p id='${pID}' onclick="window.electronAPI.alert(this.id)">\nTitleBarButton \'${eventName}\' emitted!</p>\`
            `)
        })
    })

    ipcMain.on('alert', (event, pID) => {
        dialog.showMessageBox(window, {
            title: 'Event Object',
            message: JSON.stringify(events[pID - 1], undefined, 4)
        })
    })
    
    window.on('ready-to-show', () => {
        window.show()
    })

    window.loadFile(path.join(__dirname, 'index.html'))
}