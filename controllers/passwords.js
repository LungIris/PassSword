const {DataTypes}= require('sequelize')
const { sequelize } = require('../models');
const { ipcMain } = require('electron')
const passwords = require('../models/passwords')(sequelize, DataTypes);

const newPassword = () => {
    console.log("this is new password");
    ipcMain.on('new-password', async (event, data) => {
        console.log("this is IPC new password");
        const title = data.title;
        const address = data.address;
        const user = data.user;
        const password = data.password;
        const folder = data.folder;
        try {
            await passwords.create({ title, address, user, password,folder });
            event.sender.send('password-created', { success: true });

        } catch (err) {
            console.error(err);
            event.sender.send('password-created', { succes: false, error: err.message });
        }
    })
}
const populateTable = () => {
    console.log('this is populate table');
    ipcMain.on('request-passwords-data', async (event) => {
        try {
            const passwordData = await passwords.findAll();
            event.sender.send('passwords-data', passwordData);
        } catch (err) {
            console.error(err);
            event.sender.send('passwords-data', { error: err.message });
        }
    })
    ipcMain.on('move-to-folder', async (event, { selectedItem, selectedFolder }) => {

        passwords.update({ folder: selectedFolder }, { where: { title: selectedItem} })
            .then(() => {
                console.log('Item moved to folder:', selectedFolder);
            })
            .catch(error => {
                console.error('Error moving item to folder:', error);
            });
    });
}
module.exports={newPassword,populateTable}