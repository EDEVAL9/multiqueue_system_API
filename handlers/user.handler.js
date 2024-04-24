const { Sequelize, DataTypes, Op } = require("sequelize");
const { sequelize } = require("../models");
const UserModel = require("../models/user");
const { TUTOR } = require("../utilities/constants");

const UserInstance = UserModel(sequelize, DataTypes);

const getSingleUserHandler = async (req, res) => {
  const email = req.params?.email;
  if (!email) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const user = await UserInstance.findOne({
    where: {
      email: req.params?.email,
    },
  });

  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  return res.json(user);
};

const getSingleUserByIdHandler = async (req, res) => {
  const id = req.params?.id;
  if (!id) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const user = await UserInstance.findByPk(id);

  if (!user) {
    return res.status(400).json({
      message: "User not found",
    });
  }

  return res.json(user);
};

module.exports = {
  getSingleUserHandler,
  getSingleUserByIdHandler,
};
