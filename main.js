const electron = require('electron');
const url = require('url');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { app, BrowserWindow,Menu } = electron;

let mainWindow;
app.on('ready',function(){
    mainWindow = new BrowserWindow({});
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainPage.html'),
        protocol: 'file:',
        slashes: true
    }));

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainMenu);
});

const mainMenuTemplate = [
];
let db = new sqlite3.Database('./data.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to database');
})

app.on('before-quit', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Closed the database connection');
    });
});