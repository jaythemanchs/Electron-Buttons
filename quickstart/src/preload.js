const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    alert: (pID) => ipcRenderer.send('alert', pID)
})