const { Sequelize, DataTypes, Op } = require('sequelize');
const { sequelize } = require('../models');
const UserModel = require('../models/user');
const { TUTOR } = require('../utilities/constants');

const UserInstance = UserModel(sequelize, DataTypes);

const searchTutorHandler = async (req, res) => {
  const searchString = req?.query?.q;
  if (!searchString) {
    return res.json([]);
  }
  const tutors = await UserInstance.findAll({
    where: {
      [Op.and]: [
        {
          accountType: TUTOR,
        },
        {
          [Op.or]: [
            {
              firstName: {
                [Op.iLike]: `%${searchString}%`,
              },
            },
            {
              lastName: {
                [Op.iLike]: `%${searchString}%`,
              },
            },
            {
              email: {
                [Op.iLike]: `%${searchString}%`,
              },
            },
          ],
        },
      ],
    },
  });

  // const tutors = await UserInstance.findAll({
  //   where: {
  //     email: {
  //       [Op.iLike]: `%${searchString}%`,
  //     },
  //   },
  // });

  if (!tutors) {
    return res.json([]);
  }

  return res.json(tutors);
};

module.exports = {
  searchTutorHandler,
};
