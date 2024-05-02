const {DataTypes}= require('sequelize')
const { sequelize } = require('../models');
const { ipcMain } = require('electron')
const users = require('../models/users')(sequelize, DataTypes);
