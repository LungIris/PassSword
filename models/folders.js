'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class folders extends Model {
    static associate(models) {
    }
  }
  folders.init({
    folder_name: DataTypes.STRING,
    username: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'folders',
    freezeTableName: true,
    timestamps: false
  });
  return folders;
};