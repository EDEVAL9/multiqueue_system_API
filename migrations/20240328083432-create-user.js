"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      firstName: {
        type: Sequelize.STRING,
      },
      lastName: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      verificationCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      accountType: {
        type: Sequelize.STRING,
        defaultValue: "STUDENT",
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: "ACTIVE",
      },
      msGraphAccessToken: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      msGraphRefreshToken: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      msGraphUserId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
