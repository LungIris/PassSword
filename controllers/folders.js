const {DataTypes}= require('sequelize')
const { sequelize } = require('../models');
const { ipcMain } = require('electron')
const folders = require('../models/folders')(sequelize, DataTypes);
const passwords = require('../models/passwords')(sequelize, DataTypes);

const newFolder = () => {
    ipcMain.on('new-folder', async (event, data) => {
        const folder_name  = data.folder_name;
        try {
            await folders.create({ folder_name });
            event.sender.send('folder-created', { success: true,folder_name });
           
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
ipcMain.on('move-to-folder', async (event, { selectedItem, selectedFolder }) => {

    passwords.update({ folder: selectedFolder }, { where: { title: selectedItem} })
        .then(() => {
            console.log('Item moved to folder:', selectedFolder);
        })
        .catch(error => {
            console.error('Error moving item to folder:', error);
        });
});

ipcMain.on('delete-folder', async (event, { folder_name }) => {
    try {
        const result = await folders.destroy({
            where: { folder_name: folder_name }
        });
    } catch (error) {
        console.error('Error deleting folder:', error);
    }
});


module.exports={newFolder,populateSubmenu}