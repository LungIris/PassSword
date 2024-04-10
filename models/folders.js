'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class folders extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  folders.init({
    folder_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'folders',
    freezeTableName: true,
    timestamps: false
  });
  return folders;
};