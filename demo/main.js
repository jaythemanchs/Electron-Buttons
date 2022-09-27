const { BrowserWindow, app, Menu, ipcMain } = require('electron')
const path = require('path')
const { TitleBarButton } = require('../').main

app.on('ready', () => {
    createWindow()
})

function createWindow() {
    const window = new BrowserWindow({
        width: 606,
        height: 500,
        backgroundColor: 'white',
        frame: false,
        show: false,
        titleBarOverlay: {
            height: 32,
            color: '#aaaaaa',
            symbolColor: 'black'
        },
        titleBarStyle: 'hidden',
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    })

    window.on('ready-to-show', () => {
        window.show()
        const titleBarButton1 = new TitleBarButton(window, {
            id: 'button1',
            height: 32,
            icon: path.join(__dirname, 'images/Facebook-Mark-512px-plus.png'),
            color: '#aaaaaa',
            tryToAnalyse: true,
            buttonID: 'titleBarButton1',
            show: true
        })
        /*const titleBarButton2 = new TitleBarButton(window, {
            id: 'button2',
            height: 40,
            icon: path.join(__dirname, 'images/Google-Mark-500px-plus.png'),
            color: '#aaaaaa',
            tryToAnalyse: true,
            buttonID: 'titleBarButton2',
        })
        const titleBarButton3 = new TitleBarButton(window, {
            id: 'button3',
            height: 40,
            icon: path.join(__dirname, 'images/GitHub-Mark-120px-plus.png'),
            color: '#aaaaaa',
            tryToAnalyse: true,
            buttonID: 'titleBarButton3',
        })*/
        console.log(TitleBarButton.pixelsConsumed(window));
    })

    ipcMain.on('titleBar', (event, optionsArg) => {
        const options = typeof optionsArg == 'object' ? optionsArg : {}
        window.setTitleBarOverlay(options)
    })

    window.loadFile(path.join(__dirname, 'index.html'))
    Menu.setApplicationMenu(Menu.buildFromTemplate([{
        label: '&File',
        submenu: [
            {
                role: 'quit'
            },
            {
                role: 'toggleDevTools'
            },
            {
                role: 'reload'
            }
        ]
    }]))
}