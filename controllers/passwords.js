const {DataTypes,Op}= require('sequelize')
const { sequelize } = require('../models');
const { ipcMain } = require('electron')
const passwords = require('../models/passwords')(sequelize, DataTypes);
const folders = require('../models/folders')(sequelize, DataTypes);
const users = require('../models/users')(sequelize, DataTypes);

const crypto = require('crypto');
const bcrypt = require('bcrypt');

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

    ipcMain.on('update-password', async (event, {title,address, user, password ,username,sessionKey}) => {
        try {
        
            const key = Buffer.from(sessionKey, 'hex');
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
            let encryptedPassword = cipher.update(password, 'utf8', 'hex');
            encryptedPassword += cipher.final('hex');

            const result = await passwords.update(
                { address:address, user:user, password:encryptedPassword,iv: iv.toString('hex') , username: username },
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
    ipcMain.on('request-analytics-data', async (event,{username}) => {
        const data = {
            totalItems: await getTotalItems(username),
            foldersNumber: await getFoldersNumber(username),
            deletedItems: await getDeletedItems(username),
        };
        event.reply('analytics-data-response', data);
    });
    
    async function getTotalItems(username) {
        return passwords.count({
        where: {
            username: username,
            folder: { [Op.ne]: 'trash' }
        }
        });
    }
    
    async function getFoldersNumber(username) {
        return folders.count({ where: { username } });
     }
    
 
    
    async function getDeletedItems(username) {
        return passwords.count({
            where: {
                folder: 'trash',
                username:username
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
    ipcMain.on('empty-trash', async (event, { username }) => {
        try {
            const result = await passwords.destroy({
                where: { folder: 'trash', username: username }
            });
            if (result > 0) {
                event.reply('empty-trash-response', { success: true, message: 'Trash emptied successfully' });
            } else {
                event.reply('empty-trash-response', { success: false, message: 'No items found in trash' });
            }
        } catch (error) {
            console.error('Error deleting items:', error);
            event.reply('empty-trash-response', { success: false, message: error.message });
        }
    });
    ipcMain.on('password-request', async (event, { oldPassword, newPass, username , decryptedPasswords}) => {
        const user = await users.findOne({ where: { username } });
        if (!user || !await bcrypt.compare(oldPassword, user.hash)) {
            event.reply('change-password-response', { success: false, message: 'Invalid old password.' });
            return;
        }
        if (!validatePassword(newPass)) {
            event.reply('change-password-response', { success: false, message: 'Password does not meet security criteria.' });
            return;
        }
        const passwordData = await passwords.findAll({
            where: {
                username: username,
                folder: { [Op.ne]: 'trash' }
            },
            attributes: [ 'title', 'address', 'user', 'password', 'iv', 'folder', 'username']
        });
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPass, salt);
        await users.update({ hash, salt }, { where: { username } });
        const newKey =await generateKey(hash, salt);
        event.reply('change-password-response', { success: true ,passwordData,newKey,decryptedPasswords});
    })
    function generateKey(hash, salt) {
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(hash, salt, 100000, 32, 'sha512', (err, key) => {
                if (err) reject(err);
                else resolve(key.toString('hex'));
            });
        });
    }


    function validatePassword(password) {
        const minLength = 15;
        const hasNumbers = /\d/;
        const hasUpper = /[A-Z]/;
        const hasLower = /[a-z]/;
        const hasSpecial = /[!@#\$%\^\&*\)\(+=._-]/;
    
        if (password.length < minLength) {
            alert("Password must be at least 15 characters long.");
            return false;
        }
        if (!hasNumbers.test(password)) {
            alert("Password must include at least one number.");
            return false;
        }
        if (!hasUpper.test(password)) {
            alert("Password must include at least one uppercase letter.");
            return false;
        }
        if (!hasLower.test(password)) {
            alert("Password must include at least one lowercase letter.");
            return false;
        }
        if (!hasSpecial.test(password)) {
            alert("Password must include at least one special character.");
            return false;
        }
        return true;
    }
    
    ipcMain.on('get-password-data', async (event,{username}) => {
        const passwordData = await passwords.findAll({
            where: {
                username: username,
                folder: { [Op.ne]: 'trash' }
            },
            attributes: ['title', 'address', 'user', 'password', 'iv', 'folder', 'username']
        });
        if (passwordData) {
            event.reply('password-data-response', { success: true, data: passwordData });
        } else {
            event.reply('password-data-response', { success: false, message: 'No password data found' });
        }
    })
    ipcMain.on('get-password-data-new', async (event,{username}) => {
        const passwordData = await passwords.findAll({
            where: {
                username: username,
                folder: { [Op.ne]: 'trash' }
            },
            attributes: [ 'password', 'iv']
        });
        if (passwordData) {
            event.reply('password-data-response-new', { success: true, data: passwordData });
        } else {
            event.reply('password-data-response-new', { success: false, message: 'No password data found' });
        }
    })
}
module.exports={newPassword,populateTable}