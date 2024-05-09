const { app, BrowserWindow } = require('electron');
const {sequelize} = require('./models');
const path = require("path");
const folders = require("./controllers/folders");
const passwords = require("./controllers/passwords");
const users = require("./controllers/users");
const AutoLaunch = require('electron-auto-launch');

const createWindow = () => {
    const mainWindow = new BrowserWindow({
      width: 900,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration:true

      }
    })
  
    mainWindow.loadFile('interface/mainPage.html')

    sequelize.sync().then(() => {
        console.log('Connection established');
        folders.newFolder()
        folders.populateSubmenu()
        passwords.newPassword()
        passwords.populateTable()
        users.handleUsers()
    })
    
    
}
const appAutoLauncher = new AutoLaunch({
    name: 'PassSword',
    path: app.getPath('exe'),
})
app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
      })
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
