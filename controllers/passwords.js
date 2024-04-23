const {DataTypes,Op}= require('sequelize')
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
            const passwordData = await passwords.findAll({
                where: {
                    folder: {
                        [Op.ne]: 'trash'
                    }
                }
            });
            event.sender.send('passwords-data', passwordData);
        } catch (err) {
            console.error(err);
            event.sender.send('passwords-data', { error: err.message });
        }
    })
    ipcMain.on('request-favorites-data', async (event) => {
        try {
            const favoritesData = await passwords.findAll({
                where: {folder: 'favorites'}
            })
            event.sender.send('favorites-data',favoritesData)
        }catch (err) {
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
    ipcMain.on('remove-item-from-folder', async (event, { itemTitle }) => {
        passwords.update({ folder: null }, { where: { title: itemTitle } })
            .then(() => {
                console.log('Item removed from folder');
                event.sender.send('folder-removed', { success: true });
        })
        .catch(error => {
            console.error('Error removing item from folder:', error);
            event.sender.send('folder-removed', { success: false, error: error.message });
        });
    });
    
ipcMain.on('set-folder-to-favorites', async (event, { itemTitle }) => {
    passwords.update({ folder: "favorites" }, { where: { title: itemTitle } })
            .then(() => {
                console.log('Item moved to favorites');
        })
        .catch(error => {
            console.error('Error moving item to favorites:', error);
        });
});
ipcMain.on('remove-favorites-from-folders', async (event, { itemTitle }) => {
    passwords.update({ folder: null }, { where: { title: itemTitle } })
            .then(() => {
                console.log('Item removed from favorites');
        })
        .catch(error => {
            console.error('Error removing item from favorites:', error);
        });
});
ipcMain.on('move-item-to-trash', async (event, { itemTitle }) => {
    passwords.update({ folder: 'trash' }, { where: { title: itemTitle } })
            .then(() => {
                console.log('Item moved to trash');
        })
        .catch(error => {
            console.error('Error moving item to trash:', error);
        });
});
ipcMain.on('request-trash-data', async (event) => {
    try {
        const trashData = await passwords.findAll({
            where: {folder: 'trash'}
        })
        event.sender.send('trash-data',trashData)
    }catch (err) {
        console.error(err);
        event.sender.send('trash-data', { error: err.message });
    }
})
}
module.exports={newPassword,populateTable}