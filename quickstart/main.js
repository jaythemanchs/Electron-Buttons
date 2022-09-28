const { BrowserWindow, app, Menu, ipcMain } = require('electron')
const { TitleBarButton } = require('electron-buttons').Main
const path = require('path')

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
        icon: path.join(__dirname, 'images/GitHub-Mark-120px-plus.png'),
        color: '#ffffff',
        tryToAnalyse: true,
        buttonID: 'titleBarButton',
        show: true
    })

    titleBarButton.on('click', (event) => {
        console.log(event)
    })

    titleBarButton
    
    window.on('ready-to-show', () => {
        window.show()
    })

    window.loadFile(path.join(__dirname, 'index.html'))
}