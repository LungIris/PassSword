const {DataTypes,Op}= require('sequelize')
const { sequelize } = require('../models');
const { ipcMain } = require('electron')
const passwords = require('../models/passwords')(sequelize, DataTypes);
const folders = require('../models/folders')(sequelize, DataTypes);

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
                    [Op.or]: [
                        { folder: { [Op.ne]: 'trash' } },
                        { folder: { [Op.is]: null } } 
                    ]
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
    ipcMain.on('recover-item', async (event, { itemTitle }) => {
        passwords.update({ folder: null }, { where: { title: itemTitle } })
            .then(() => {
                console.log('Item recovered');
            })
            .catch(error => {
                console.error('Error recovering item:', error);
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
    ipcMain.on('permanently-delete', async (event, { itemTitle }) => {
        try {
            const result = await passwords.destroy({
                where: { title: itemTitle }
            });
            if (result > 0) { // Check if any rows were deleted
                console.log('Item permanently deleted:', itemTitle);
                event.sender.send('item-deleted', { success: true, title: itemTitle });
            } else {
                throw new Error('No item found with specified title.');
            }
        }catch (error) {
            console.error('Error deleting item:', error);
            event.sender.send('item-deleted', { success: false, error: error.message });
        }
    })
    ipcMain.on('request-folder-items', async (event, { currentFolder }) => {
        try {
            const folderData = await passwords.findAll({
                where: {folder: currentFolder}
            })
            event.sender.send('folder-items-data',folderData)
        }catch (err) {
            console.error(err);
            event.sender.send('folder-items-data', { error: err.message });
        }
    })

    ipcMain.on('update-password', async (event, {title,address, user, password }) => {
        try {
            const result = await passwords.update(
                { address:address, user:user, password:password },
                { where: {title } }
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
        
    
}
module.exports={newPassword,populateTable}