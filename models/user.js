'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: DataTypes.STRING,
      verificationCode: DataTypes.STRING,
      accountType: DataTypes.STRING,
      status: DataTypes.STRING,
      msGraphAccessToken: DataTypes.STRING,
      msGraphRefreshToken: DataTypes.STRING,
      msGraphUserId: DataTypes.STRING,
      password: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'User',
      paranoid: true,
      timestamps: true,
    }
  );
  return User;
};
