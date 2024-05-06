const {DataTypes,Op}= require('sequelize')
const { sequelize } = require('../models');
const { ipcMain } = require('electron')
const passwords = require('../models/passwords')(sequelize, DataTypes);
const folders = require('../models/folders')(sequelize, DataTypes);
const crypto = require('crypto');

const newPassword = () => {
    ipcMain.on('new-password', async (event, data) => {
        try {
            const { title, address, user, plainPassword, folder, sessionKey,username } = data;
            const key = Buffer.from(sessionKey, 'hex');
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
            let encryptedPassword = cipher.update(plainPassword, 'utf8', 'hex');

            encryptedPassword += cipher.final('hex');

            await passwords.create({ title, address, user, password: encryptedPassword,iv: iv.toString('hex') , folder, username: username });
            event.sender.send('password-created', { success: true });
        } catch (err) {
            console.error('Error in new-password handler:', err);
            event.sender.send('password-created', { success: false, error: err.message });
        }
    })
}
const populateTable = () => {

    ipcMain.on('request-passwords-data', async (event, { username }) => {

        try {
            const passwordData = await passwords.findAll({
                where: {
                    [Op.or]: [
                        { folder: { [Op.ne]: 'trash' } },
                        { folder: { [Op.is]: null } } 
                    ],
                    username:username
                }
            });
            event.sender.send('passwords-data', passwordData);
        } catch (err) {
            console.error(err);
            event.sender.send('passwords-data', { error: err.message });
        }
    })
    ipcMain.on('request-favorites-data', async (event,{username}) => {
        try {
            const favoritesData = await passwords.findAll({
                where: {folder: 'favorites',username:username}
            })
            event.sender.send('favorites-data',favoritesData)
        }catch (err) {
            console.error(err);
            event.sender.send('passwords-data', { error: err.message });
        }
    })
    ipcMain.on('move-to-folder', async (event, { selectedItem, selectedFolder ,username}) => {

        passwords.update({ folder: selectedFolder }, { where: { title: selectedItem,username:username} })
            .then(() => {
            })
            .catch(error => {
                console.error('Error moving item to folder:', error);
            });
    });
    ipcMain.on('remove-item-from-folder', async (event, { itemTitle,username }) => {
        passwords.update({ folder: null }, { where: { title: itemTitle ,username:username} })
            .then(() => {
                event.sender.send('folder-removed', { success: true });
        })
        .catch(error => {
            console.error('Error removing item from folder:', error);
            event.sender.send('folder-removed', { success: false, error: error.message });
        });
    });
    
ipcMain.on('set-folder-to-favorites', async (event, { itemTitle ,username}) => {
    passwords.update({ folder: "favorites" }, { where: { title: itemTitle,username:username } })
            .then(() => {
        })
        .catch(error => {
            console.error('Error moving item to favorites:', error);
        });
});
    ipcMain.on('recover-item', async (event, { itemTitle ,username}) => {
        passwords.update({ folder: null }, { where: { title: itemTitle,username:username } })
            .then(() => {
            })
            .catch(error => {
                console.error('Error recovering item:', error);
            });
    });
ipcMain.on('remove-favorites-from-folders', async (event, { itemTitle ,username}) => {
    passwords.update({ folder: null }, { where: { title: itemTitle ,username:username} })
            .then(() => {
        })
        .catch(error => {
            console.error('Error removing item from favorites:', error);
        });
});
ipcMain.on('move-item-to-trash', async (event, { itemTitle,username }) => {
    passwords.update({ folder: 'trash' }, { where: { title: itemTitle ,username:username} })
            .then(() => {
        })
        .catch(error => {
            console.error('Error moving item to trash:', error);
        });
});
ipcMain.on('request-trash-data', async (event,{username}) => {
    try {
        const trashData = await passwords.findAll({
            where: {folder: 'trash', username:username}
        })
        event.sender.send('trash-data',trashData)
    }catch (err) {
        console.error(err);
        event.sender.send('trash-data', { error: err.message });
    }
})
    ipcMain.on('permanently-delete', async (event, { itemTitle,username }) => {
        try {
            const result = await passwords.destroy({
                where: { title: itemTitle, username:username }
            });
            if (result > 0) { 
                event.sender.send('item-deleted', { success: true, title: itemTitle });
            } else {
                throw new Error('No item found with specified title.');
            }
        }catch (error) {
            console.error('Error deleting item:', error);
            event.sender.send('item-deleted', { success: false, error: error.message });
        }
    })
    ipcMain.on('request-folder-items', async (event, { currentFolder,username }) => {
        try {
            const folderData = await passwords.findAll({
                where: {folder: currentFolder, username:username}
            })
            event.sender.send('folder-items-data',folderData)
        }catch (err) {
            console.error(err);
            event.sender.send('folder-items-data', { error: err.message });
        }
    })

    ipcMain.on('update-password', async (event, {title,address, user, password ,username}) => {
        try {
            const result = await passwords.update(
                { address:address, user:user, password:password },
                { where: {title,username } }
            );
            if (result[0] > 0) {
                event.reply('update-password-response', { success: true, message: 'Password updated successfully.' });
            } else {
                throw new Error('No record found to update.');
            }
        } catch (error) {
            console.error('Error updating password:', error);
            event.reply('update-password-response', { success: false, message: error.message });
        }
    });
    ipcMain.on('request-analytics-data', async (event) => {
        const data = {
            totalItems: await getTotalItems(),
            foldersNumber: await getFoldersNumber(),
            reusedPasswords: await getReusedPasswords(),
            deletedItems: await getDeletedItems(),
        };
        event.reply('analytics-data-response', data);
    });

    async function getTotalItems() {
        return passwords.count();
    }
    
    async function getFoldersNumber() {
        return folders.count();
     }
    
    async function getReusedPasswords() {
        return passwords.count({
            where: {
                password: {
                    [Op.in]: sequelize.literal('(SELECT password FROM passwords GROUP BY password HAVING COUNT(password) > 1)')
                }
            }
        });
          }
    
    async function getDeletedItems() {
        return passwords.count({
            where: {
                folder: 'trash'
            }
        });
         }
    
    ipcMain.on('request-strength-data', async (event) => {
        try {
            const results = await passwords.findAll({
                attributes: ['password']
            });
            const passwordsArray = results.map(result => result.password);  
            event.sender.send('strength-data', passwordsArray);  
    

        } catch (error) {
            console.error('Failed to fetch passwords:', error);
            throw error;
        }
    });
    ipcMain.on('empty-trash', async (event,username) => {
        try {
            const result = await passwords.destroy({
                where: { folder: 'trash',username:username }
            });
        }catch (error) {
            console.error('Error deleting items:', error);
        }
    })
        
    
}
module.exports={newPassword,populateTable}