'use strict';
const { Model } = require('sequelize');
const user = require('./user');
module.exports = (sequelize, DataTypes) => {
  class Schedules extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Schedules.init(
    {
      subject: DataTypes.STRING,
      description: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      startTime: {
        type: DataTypes.DATE,
      },
      endTime: {
        type: DataTypes.DATE,
      },
      tutorId: {
        type: DataTypes.NUMBER,
      },
      studentId: {
        type: DataTypes.NUMBER,
      },
      MSCalendarEventId: {
        type: DataTypes.TEXT,
      },
      recurrence: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      MSCalendarEventId: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      isAllDay: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'BOOKED',
      },
      reminderSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Schedules',
    }
  );
  Schedules.belongsTo(user(sequelize, DataTypes), {
    foreignKey: 'tutorId',
    as: 'tutor',
  });
  return Schedules;
};
