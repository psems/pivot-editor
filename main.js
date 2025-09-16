const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173'
  win.loadURL(startUrl)
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }]
  })
  if (canceled) return null
  const fs = require('fs')
  const filePath = filePaths[0]
  const contents = fs.readFileSync(filePath, 'utf8')
  return { path: filePath, contents }
})

ipcMain.handle('dialog:saveFile', async (_, defaultPath, data) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: defaultPath || 'Pipeline.osheet.modified.json',
    filters: [{ name: 'JSON', extensions: ['json'] }]
  })
  if (canceled) return null
  const fs = require('fs')
  fs.writeFileSync(filePath, data, 'utf8')
  return filePath
})
