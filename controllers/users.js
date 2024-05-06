const {DataTypes,Op}= require('sequelize')
const { sequelize } = require('../models');
const { ipcMain } = require('electron')
const users = require('../models/users')(sequelize, DataTypes);
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const handleUsers = () => {
    ipcMain.on('login-request', async (event, { username, password }) => {
        const user = await users.findOne({ where: { username } });
        if (user && await bcrypt.compare(password, user.hash)) {
            crypto.pbkdf2(user.hash, user.salt, 100000, 32, 'sha512', (err, key) => {
                if (err) {
                    console.error('Error generating key', err);
                    event.reply('login-response', { success: false, message: 'Error in key generation'});
                } else {
                    event.reply('login-response', {
                        success: true, message: 'Login successful', sessionKey: key.toString('hex'),username:username
                    });
                }
            });
        } else {
            event.reply('login-response', { success: false, message: 'Invalid credentials' });

        }
    });
    ipcMain.on('check-username-email', async (event, { username, email }) => {
        try {
            const userExists = await users.findOne({
                where: {
                    [Op.or]: [
                        { username: username },
                        { email: email }
                    ]
                }
            });
    
            event.reply('check-username-email-response', userExists ? true : false);
        } catch (error) {
            console.error('Error checking username/email:', error);
            event.reply('check-username-email-response', false);
        }
    });
    ipcMain.on('signup-request', async (event, { username, email, password }) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            await users.create({
                username:username,
                email:email,
                hash:hash,
                salt:salt
            });
            event.reply('signup-response', { success: true, message: 'User registered successfully' });

        } catch (error) {
            console.error('Signup error: ', error);
            event.reply('signup-response', { success: false, message: 'Error registering user' });

        }
    })
}
module.exports={handleUsers}