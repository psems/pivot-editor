const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (defaultPath, data) => ipcRenderer.invoke('dialog:saveFile', defaultPath, data)
})
