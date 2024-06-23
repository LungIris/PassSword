'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
 
    static associate(models) {
    }
  }
  users.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    hash: DataTypes.STRING,
    salt: DataTypes.STRING,
    browser: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'users',
    freezeTableName: true,
    timestamps: false
  });
  return users;
};