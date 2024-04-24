const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../models');
const UserModel = require('../models/user');
const { AuthorizationCodeCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
const bcrypt = require('bcrypt');
const { sendWelcomeEmail } = require('../services/mail.service');
const {
  TokenCredentialAuthenticationProvider,
} = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
const { MS_SCOPE, CALENDER_NAME } = require('../utilities/constants');
const { default: axios } = require('axios');
const { getUserCalendars } = require('../services/calendar.service');
const { createSubscription } = require('../services/schedule.service');
const { msGraphAxios } = require('../utilities/axios.config');
const generator = require('generate-password');

const UserInstance = UserModel(sequelize, DataTypes);
const registerUserHandler = async (req, res) => {
  const emailExists = await UserInstance.findOne({
    where: {
      email: req?.body?.email,
    },
  });

  if (emailExists) {
    return res.status(400).json({ message: 'Email is already taken' });
  }

  const password = generator.generate({
    length: 10,
    numbers: true,
  });
  const passwordHashed = await bcrypt.hash(password, 10);
  const newUser = await UserInstance.create({
    ...req.body,
    password: passwordHashed,
  });

  sendWelcomeEmail(newUser, password);

  res.json({
    newUser: newUser,
  });
};

const loginHandler = async (req, res) => {
  const email = req?.body?.email;

  if (!email) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
  const user = await UserInstance.findOne({
    where: {
      email: req.body?.email,
    },
  });

  if (!user) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  return res.json({ user });
};

const authorizeMSGraphHandler = async (req, res) => {
  const { code, email } = req.body;
  console.log(code, email, 'RUNNNNNINNNNNNNNNG');
  const user = await UserInstance.findOne({
    where: {
      email,
    },
  });

  if (!user) {
    return res
      .status(401)
      .json({ message: 'Authorization failed. User not found' });
  }

  const clientId = process.env.CLIENT_ID;
  const appSecret = process.env.CLIENT_SECRET;
  const tenantId = 'common';
  const redirectUri = process.env.APP_MS_REDIRECT_URL;

  try {
    const credential = new AuthorizationCodeCredential(
      tenantId,
      clientId,
      appSecret,
      code,
      redirectUri
      // 'http://localhost:3000/authorization'
    );

    const scopes = [
      'openid',
      'profile',
      'offline_access',
      'user.read',
      'calendars.read',
      'Calendars.ReadWrite',
    ];

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: MS_SCOPE,
    });

    const graphClient = Client.initWithMiddleware({
      authProvider: authProvider,
    });

    const token = await credential.getToken(scopes);

    const msProfileRes = await msGraphAxios(token.token).get('/me');

    await createSubscription(graphClient);

    await UserInstance.update(
      {
        msGraphAccessToken: token.token,
        msGraphUserId: msProfileRes?.data?.id,
      },
      {
        where: {
          email,
        },
      }
    );

    return res.json({ data: user, message: 'Authorization successful' });
  } catch (e) {
    console.log(e);
    console.log('AUTHORIZAIO FAILED');
    return res.status(400).json({ message: 'Authorization failed' });
  }
};

module.exports = {
  registerUserHandler,
  loginHandler,
  authorizeMSGraphHandler,
};
