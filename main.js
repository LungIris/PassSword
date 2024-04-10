const { app, BrowserWindow } = require('electron');
const {sequelize} = require('./models');
const path = require("path");
const folders = require("./controllers/folders");
const createWindow = () => {
    const mainWindow = new BrowserWindow({
      width: 900,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: false,
            nodeIntegration:true

      }
    })
  
    mainWindow.loadFile('interface/mainPage.html')

    sequelize.sync().then(() => {
        console.log('Connection established');
        folders.newFolder()
    })
    
    
}
app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
