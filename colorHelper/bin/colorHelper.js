#! /usr/bin/env node
if (process.argv.slice(2).findIndex((arg) => arg == '--help') >= 0) {
    console.log('')
    console.log('Electron-Buttons Color Helper v' + require('../package.json').version + ' - A wizard to get the colorOnHover and colorOnClick values for TitleBarButton\'s.')
    console.log('')
    console.log('Usage:')
    console.log('colorhelper')
    console.log('colorhelper --color=\'<color>\' --symbol-color=\'<symbol-color>\'')
    console.log('')
    console.log('Options:')
    console.log('[--color=\'<color\'>] [--symbol-color=\'<symbol-color>\']')
    console.log('')
    console.log('Go to \'https://github.com/jaythemanchs/Electron-Buttons/tree/main/colorHelper\' for more info.')
    console.log('')
} else {
    const { spawn } = require('child_process')
    const readline = require('readline')
    const fileId = require('crypto').randomUUID()
    const { writeFile, unlink, existsSync, readFileSync } = require('fs')
    const path = require('path')
    const filePath = path.join(process.cwd(), fileId + '.txt')
    let loader = loaderStart('Waiting for electron to start...')
    let windowLoader = 0
    let color = ''
    let colorOnHover = ''
    let colorOnClick = ''
    const fastRun = process.argv.filter(arg => arg.startsWith('--color') || arg.startsWith('--symbol-color')).length != 0
    const hex = fastRun ? process.argv.filter(arg => arg.startsWith('--color='))[0].substring(8) : null
    const symbolHex = fastRun ? process.argv.filter(arg => arg.startsWith('--symbol-color'))[0].substring(15) : null
    const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
    if (fastRun) {
        if (hexRegex.test(hex) && hexRegex.test(symbolHex)) {
            color = hex
        } else if (hexRegex.test(hex)) {
            console.error('Invalid hex passed for argument \'--symbol-color\'')
            process.exit()
        } else if (hexRegex.test(symbolHex)) {
            console.error('Invalid hex passed for argument \'--color\'')
            process.exit()
        } else {
            console.error('Invalid hex passed for argument \'--color\' and argument \'--symbol-color\'')
            process.exit()
        }
    }

    function loaderStart(extraInfo) {
        let loaders = ['-', '\\', '|', '/']
        let loaderState = 0
        return setInterval(() => {
            process.stdout.write('\r' + loaders[loaderState++] + (extraInfo != undefined ? ' ' + extraInfo : ''))
            loaderState = loaderState % loaders.length
        }, 250)
    }

    function loaderStop(loader, hide = true) {
        clearInterval(loader)
        if (hide) {
            process.stdout.clearLine(0)
            process.stdout.cursorTo(0)
        } else process.stdout.write('\n')
    }

    function waitForSpace() {
        return new Promise((resolve, reject) => {
            let spaceLoader = loaderStart('Waiting for you to press Space...')
            readline.emitKeypressEvents(process.stdin)
            process.stdin.setRawMode(true)
            process.stdin.resume()
            process.stdin.on('keypress', (event, key) => {
                if (key.name == 'space') {
                    loaderStop(spaceLoader)
                    process.stdin.setRawMode(false)
                    process.stdin.pause()
                    process.stdin.removeAllListeners('keypress')
                    resolve()
                } else if (key.name === 'escape' || (key.name === 'c' && key.ctrl)) {
                    loaderStop(spaceLoader)
                    process.stdin.setRawMode(false)
                    process.stdin.pause()
                    process.stdin.removeAllListeners('keypress')
                    process.exit()
                }
            })
        })
    }

    const child = spawn('npx', ['electron', 'bin/electronHelper.js', `--fileId=${fileId}`], {
        cwd: process.cwd(),
        shell: true
    })

    child.on('error', (err) => {
        console.log(err)
    })

    child.on('error', (err) => {
        console.error(err)
        process.exit()
    })

    child.stdout.setEncoding('utf8')
    child.stdout.on('data', (data) => {
        switch (String(data).replace(/[^\x20-\x7E]+/g, '')) {
            case 'ready':
                loaderStop(loader)
                console.log('Electron started...')
                const ipcLoader = loaderStart('Waiting for IPC to start...')
                writeFile(`${fileId}.txt`, '', {
                    encoding: 'utf8'
                }, (err) => {
                    if (err) { console.error(err); process.exit() }
                    loaderStop(ipcLoader)
                    console.log('IPC started...')
                    if (!fastRun) {
                        console.log(`\nWelcome to the Electron-Buttons Color Helper! To start, press Space and follow the instructions.\n`)
                        waitForSpace().then(() => {
                            console.log('Input the color you use for the \'WindowsTitleBarOverLay.color\' parameter. This value needs to be a six-digit hex color, for example, \'white\' would be \'#ffffff\'')
                            askQuestion('WindowsTitleBarOverlay.color: ', /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i, 'Invalid Hex!').then((colorParam) => {
                                color = colorParam
                                askQuestion('WindowsTitleBarOverlay.symbolColor: ', /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i, 'Invalid Hex!').then((symbolColorParam) => {
                                    writeFile(filePath, readFileSync(filePath, { encoding: 'utf8' }).replace(/[^\x20-\x7E]+/g, '') + '\n' + JSON.stringify({ hex: colorParam, symbolHex: symbolColorParam }), () => {
                                        windowLoader = loaderStart('Waiting for window to load...')
                                    })
                                })
                            })
                        })
                    } else {
                        writeFile(filePath, readFileSync(filePath, { encoding: 'utf8' }).replace(/[^\x20-\x7E]+/g, '') + '\n' + JSON.stringify({ hex: hex, symbolHex: symbolHex }), () => {
                            windowLoader = loaderStart('Waiting for window to load...')
                        })
                    }
                })
                break
            case 'window_loaded':
                loaderStop(windowLoader)
                console.log('Window loaded...')
                break
            case 'completed':
                console.log('Use these values in your TitleBarButton\'s options object along with your other options.\n')
                console.log(`   {`)
                console.log(`       color: '${color}',`)
                console.log(`       colorOnHover: '#${colorOnHover.replace(/[^\x20-\x7E]+/g, '')}',`)
                console.log(`       colorOnClick: '#${colorOnClick.replace(/[^\x20-\x7E]+/g, '')}'`)
                console.log(`   }\n`)
                process.exit()
                break
            default:
                if (String(data).startsWith('color1hex')) {
                    colorOnHover = String(data).substring(9)
                } else if (String(data).startsWith('color2hex')) {
                    colorOnClick = String(data).substring(9)
                }
                break
        }
    })

    function askQuestion(question, regexFormat, invalidAnswerText) {
        return new Promise((resolve, reject) => {
            const interface = readline.createInterface(process.stdin, process.stdout)
            interface.question(question, (answer) => {
                interface.close()
                if (regexFormat) {
                    if (regexFormat.exec(answer) != null) {
                        resolve(answer)
                    } else {
                        console.log(invalidAnswerText)
                        askQuestion(question, regexFormat, invalidAnswerText).then((answer) => resolve(answer))
                    }
                } else {
                    resolve(answer)
                }
            })
            interface.on('SIGINT', () => {
                interface.close()
                process.emit('SIGINT')
            })
        })
    }

    function exit() {
        if (existsSync(filePath)) {
            const rmLoader = loaderStart('Clearing IPC file ' + filePath)
            unlink(filePath, (err) => {
                if (err) { console.error(err); process.exit() }
                loaderStop(rmLoader)
                process.kill(process.pid)
            })
        } else {
            process.kill(process.pid)
        }
    }

    process.on('exit', exit).on('SIGINT', exit)
}