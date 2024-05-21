'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  users.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    hash: DataTypes.STRING,
    salt: DataTypes.STRING,
    browser: DataTypes.STRING,
    masterUser: DataTypes.STRING,
    touchID: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'users',
    freezeTableName: true,
    timestamps: false
  });
  return users;
};