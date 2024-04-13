'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class passwords extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  passwords.init({
    title: DataTypes.STRING,
    address: DataTypes.STRING,
    user: DataTypes.STRING,
    password: DataTypes.STRING,
    folder: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'passwords',
    freezeTableName: true,
    timestamps: false
  });
  return passwords;
};