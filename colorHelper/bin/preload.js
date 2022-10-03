const { nativeImage, ipcRenderer } = require('electron')
let stage = 1

ipcRenderer.on('canvas',
    /**
        @param {number} scaleFactor
        @param {string} dataURL
    */
    (event, scaleFactor, dataURL) => {
        console.log(scaleFactor, dataURL)
        let image = nativeImage.createFromDataURL(dataURL)
        let canvas = document.querySelector('canvas')
        console.log(image.getSize())
        canvas.width = innerWidth
        canvas.height = innerHeight + 48
        document.body.append(canvas)
        let ctx = canvas.getContext('2d')
        let img = document.createElement('img')
        img.onload = () => {
            ctx.drawImage(img, 0, 0, image.getSize().width, image.getSize().height, 0, 0, screen.width, screen.height)
            let rgba = ctx.getImageData(1536 - 130, 20, 1, 1).data
            ipcRenderer.send('color' + stage, rgba[0], rgba[1], rgba[2])
            stage++
        }
        img.src = image.toDataURL()
    })