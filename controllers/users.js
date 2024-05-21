const {DataTypes,Op}= require('sequelize')
const { sequelize } = require('../models');
const { ipcMain } = require('electron')
const users = require('../models/users')(sequelize, DataTypes);
const passwords = require('../models/passwords')(sequelize, DataTypes);
const folders = require('../models/folders')(sequelize, DataTypes);

const bcrypt = require('bcrypt');
const crypto = require('crypto');

const handleUsers = () => {
    ipcMain.on('login-request', async (event, { username, password }) => {
        const user = await users.findOne({ where: { username } });
        if (user && await bcrypt.compare(password, user.hash)) {
                 event.reply('login-response', {
                    success: true, message: 'Login successful', username: username
            });
        } else {
            event.reply('login-response', { success: false, message: 'Invalid username or password' });

        }
        
    });
    ipcMain.on('get-key', async (event, { username }) => {
            const user = await users.findOne({ where: { username } });
            if (user) {
                crypto.pbkdf2(user.hash, user.salt, 100000, 32, 'sha512', (err, key) => {
                    if (err) {
                        console.error('Error generating key:', err);
                        event.reply('get-key-response', { success: false, message: 'Error in key generation' });
                    } else {
                        event.reply('get-key-response', {
                            success: true,
                            sessionKey: key.toString('hex'),
                            message: 'Key generated successfully'
                        });
                    }
                });
            } else {
                event.reply('get-key-response', { success: false, message: 'User not found' });
            }
    
    });
    ipcMain.on('check-username-email', async (event, { username, email,password }) => {
        try {
            const userExists = await users.findOne({
                where: {
                    [Op.or]: [
                        { username: username },
                        { email: email }
                    ]
                }
            });
    
            event.reply('check-username-email-response', userExists ? true : false,username,email,password);
        } catch (error) {
            console.error('Error checking username/email:', error);
            event.reply('check-username-email-response', false);
        }
    });
    ipcMain.on('check-change-username', async (event, { username }) => {
        try {
            const userExists = await users.findOne({
                where: {
                    [Op.or]: [
                        { username: username },
                    ]
                }
            });
    
            event.reply('check-change-username-response', userExists ? true : false);
        } catch (error) {
            console.error('Error checking username:', error);
            event.reply('check-change-username-response', false);
        }
    });
    ipcMain.on('check-change-email', async (event, { email }) => {
        try {
            const userExists = await users.findOne({
                where: {
                    [Op.or]: [
                        { email: email },
                    ]
                }
            });
    
            event.reply('check-change-email-response', userExists ? true : false);
        } catch (error) {
            console.error('Error checking email:', error);
            event.reply('check-change-email-response', false);
        }
    });

   ipcMain.on('update-username', async (event, { oldUsername, username }) => {
    try {
            const updateUser = await users.update({ username }, {
                where: { username: oldUsername },
            });

            const updatePasswords = await passwords.update({ username }, {
                where: { username: oldUsername },
            });

            const updateFolders = await folders.update({ username }, {
                where: { username: oldUsername },
            });

            event.reply('update-username-response', { success: true, message: 'Username updated successfully',username });
        }
         catch (error) {
        console.error('Failed to update username:', error);
        event.reply('update-username-response', { success: false, message: 'Failed to update username', error: error.message });
    }
});
ipcMain.on('update-email', async (event, { email, username }) => {
    try {
            const updateUser = await users.update({ email }, {
                where: { username: username },
            });

            event.reply('update-email-response', { success: true, message: 'Email updated successfully',email });
        }
         catch (error) {
        console.error('Failed to update email:', error);
        event.reply('update-email-response', { success: false, message: 'Failed to update email', error: error.message });
    }   
    
});
ipcMain.on('update-browser-preference', async (event, { username, browser }) => {
    try {
        const result = await users.update({ browser }, { where: { username } });
        console.log('Database updated successfully:', result);
    } catch (error) {
        console.error('Failed to update database:', error);
    }
});
    
    ipcMain.on('get-browser', async (event, { username }) => {
        try {
            const user = await users.findOne({
                where: {
                    username: username
                },
            });
            if (user) {
                event.reply('send-browser', { browser: user.browser });
            } else {
                event.reply('send-browser', { email: null });
            }
        } catch (error) {
            console.error('Error fetching user browser:', error);
            event.reply('send-browser', { email: null });
        }
    });
        ipcMain.on('signup-request', async (event, { username, email, password }) => {
            try {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(password, salt);
                await users.create({
                    username: username,
                    email: email,
                    hash: hash,
                    salt: salt,
                    browser:'Google Chrome'
                });
                event.reply('signup-response', { success: true, message: 'User registered successfully',username });

            } catch (error) {
                console.error('Signup error: ', error);
                event.reply('signup-response', { success: false, message: 'Error registering user' });

            }
        })
        ipcMain.on('change-email', async (event, { username }) => {
            try {
                const user = await users.findOne({ where: { username } });
                if (user) {
                    event.reply('email-response', { success: true, email: user.email });
                } else {
                    event.reply('email-response', { success: false, message: "User not found" });
                }
            } catch (error) {
                console.error('Error fetching email:', error);
                event.reply('email-response', { success: false, message: error.message });
            }
        });
    }

module.exports = { handleUsers }