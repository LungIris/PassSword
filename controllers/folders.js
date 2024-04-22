const {DataTypes}= require('sequelize')
const { sequelize } = require('../models');
const { ipcMain } = require('electron')
const folders = require('../models/folders')(sequelize, DataTypes);

const newFolder = () => {
    ipcMain.on('new-folder', async (event, data) => {
        const folder_name  = data.folder_name;
        try {
            await folders.create({ folder_name });
            event.sender.send('folder-created', { success: true });
           
        } catch (err) {
            console.error(err);
            event.sender.send('folder-created', { success: false, error: err.message });
        }
    });
};
const populateSubmenu = () => {
    ipcMain.on('request-folders-data', async (event) => {
        try {
            const foldersTable = await folders.findAll();
            event.sender.send('folders-data', foldersTable); 
        }catch (err) {
            console.error(err);
            event.sender.send('folders-data', { error: err.message });
        }
        
    })   
    
}
module.exports={newFolder,populateSubmenu}