[![Banner](https://raw.githubusercontent.com/jaythemanchs/custom-windows-buttons/b8444a3b1aee22a7f9848e3313c088f582d841c8/assets/banner.svg)](./README.md)

# Electron-Buttons
Made with ❤️ by [JayTheManCHS](https://github.com/jaythemanchs)

## Introduction
Electron-Buttons is a lightweight Electron Node Module which allows the creation of custom WindowsTitlebarOverlay Buttons inside of your app.

- Require the module
```javascript
const { TitleBarButton } = require('electron-buttons')
```
- Create a button
```javascript
const myTitleBarButton = new TitleBarButton(browserWindow, {
    id: 'l',
    height: 40,
    icon: path.join(__dirname, 'accountIcon.png'),
    color: '#ffffff',
    tryToAnalyse: true,
    buttonID: 'accountButton',
})
```
- Style to your needs
```javascript
myTitleBarButton.insertCSS('img', `
    border-radius: 15px;
    border: 1px solid #eee;
`)
```

## Features

- Fully seamless creation of native-feeling titlebar buttons
- Easy Customization due to a direct interface of the DOM Element
- Event Listeners can be added easily

## Installation

The preferred method of installation is via [`npm`](https://docs.npmjs.com/).

```sh
npm i electron-buttons
```

## License
[See LICENSE](./LICENSE)
