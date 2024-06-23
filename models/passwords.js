'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class passwords extends Model {
  
    static associate(models) {
    }
  }
  passwords.init({
    title: DataTypes.STRING,
    address: DataTypes.STRING,
    user: DataTypes.STRING,
    password: DataTypes.STRING,
    iv:DataTypes.STRING,
    folder: DataTypes.STRING,
    username:DataTypes.STRING
  }, {
    sequelize,
    modelName: 'passwords',
    freezeTableName: true,
    timestamps: false
  });
  return passwords;
};