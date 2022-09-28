[![Banner](https://raw.githubusercontent.com/jaythemanchs/custom-windows-buttons/b8444a3b1aee22a7f9848e3313c088f582d841c8/assets/banner.svg)](./README.md)

# Electron-Buttons [![GitHub issues](https://img.shields.io/github/issues/jaythemanchs/Electron-Buttons)](https://github.com/jaythemanchs/Electron-Buttons/issues) [![GitHub forks](https://img.shields.io/github/forks/jaythemanchs/Electron-Buttons)](https://github.com/jaythemanchs/Electron-Buttons/network) [![GitHub stars](https://img.shields.io/github/stars/jaythemanchs/Electron-Buttons)](https://github.com/jaythemanchs/Electron-Buttons/stargazers) [![GitHub license](https://img.shields.io/github/license/jaythemanchs/Electron-Buttons)](https://github.com/jaythemanchs/Electron-Buttons/blob/main/LICENSE)
Made with ❤️ by [JayTheManCHS](https://github.com/jaythemanchs)

## Introduction
Electron-Buttons is a lightweight Electron Node Module which allows the creation of custom WindowsTitlebarOverlay Buttons inside of your app.


## Quickstart
1. Install `electron-buttons`
```sh
$ npm install electron-buttons@latest
```

2. Require `electron-buttons` in the **Main** process
```javascript
// main.js
const { app, BrowserWindow } = require('electron')
const { TitleBarButton } = require('electron-buttons/main')

// Wait until the app is ready
app.on('ready', () => {
    // Create a window
    const window = new BrowserWindow({
        width: 600,
        height: 500,
        frame: false,
        show: false,
        titleBarOverlay: {
            height: 40,
            color: '#ffffff',
            symbolColor: 'black'
        },
        titleBarStyle: 'hidden'
    })
    
    // Load a file or URL into the window
    window.loadFile('path-to-your-html-file-here')
    
    // Create a new TitleBarButton
    const button = new TitleBarButton(window, {
            id: 'button1',
            height: 40,
            icon: 'path-to-you-icon-here,
            color: '#aaaaaa',
            tryToAnalyse: true,
            buttonID: 'titleBarButton1'
        })
})
```

## Installation
Follow the steps below to start using `electron-buttons`

1. Install Node.js from https://nodejs.org/en/download/

2. Install the `electron-buttons` dependency using `npm`
```sh
$ npm install electron-buttons@latest
```
3. Require `electron-buttons` in the **Main** or **Preload** process, or otherwise in a process which has access to both `Node` and `Electron` APIs
```javascript
const { TitleBarButton } = require('electron-buttons').Main
// Or depending on the process
const { TitleBarButton } = require('electron-buttons').Renderer
```

## API
Currently work in progress.

## Contributing Guidelines
Currently, contributions are not currently accepted until after the full release. If you have any suggestions, please create an issue with the `enhancement` label.

## License
All code is licensed under the [MIT](./LICENSE) License.


## Features
- Fully seamless creation of native-feeling titlebar buttons
- Easy Customization due to a direct interface of the DOM Element
- Event Listeners can be added easily
