"use strict";
const { Client } = require("@microsoft/microsoft-graph-client");
const {
  TokenCredentialAuthenticationProvider,
} = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
const { AuthorizationCodeCredential } = require("@azure/identity");
const pino = require("pino");
const {
  createSubscription,
  createEvent,
} = require("../services/schedule.service");
const { CALENDER_NAME } = require("../utilities/constants");
const {
  getUserCalendars,
  getUserAvailability,
} = require("../services/calendar.service");

const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});
const fs = require("fs");
const { getAuthorization } = require("../services/auth.service");
//Y358Q~IDHXVKf1JQqt3eRwXKU1dti.OosEnysb0W
const clientId = process.env.CLIENT_ID;
const appSecret = process.env.CLIENT_SECRET;
const tenantId = "common";
const redirectUri = "http://localhost:8000/authorized"; // Must match the redirect URI configured in Azure portal
const scopes = [
  "openid",
  "profile",
  "offline_access",
  "user.read",
  "calendars.read",
  "Calendars.ReadWrite",
];

// Parse the access token from the URL after redirection
function parseAccessTokenFromUrl(req) {
  // const hashParams = window.location.hash.substring(1).split('&');
  // for (let i = 0; i < hashParams.length; i++) {
  //   const [key, value] = hashParams[i].split('=');
  // }
  logger.info(req.query);
  for (let [key, value] of Object.entries(req.query)) {
    if (key === "code") {
      return value.trim();
    }
  }
  return null;
}

function authenticate(res) {
  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes.join(" "))}`;
  console.log(url);
  res.redirect(url);
}
// chinedu_ukpe@outlook.com

module.exports = async function (req, res) {
  const accessToken = parseAccessTokenFromUrl(req);

  if (accessToken) {
    const credential = new AuthorizationCodeCredential(
      tenantId,
      clientId,
      appSecret,
      accessToken,
      "http://localhost:8000/authorized"
    );

    const scopes = [
      "openid",
      "profile",
      "offline_access",
      "user.read",
      "calendars.read",
      "Calendars.ReadWrite",
    ];

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes,
    });

    // authProvider.getAccessToken();

    // const tokenResponse = await credential.getToken();

    const graphClient = Client.initWithMiddleware({
      authProvider: authProvider,
    });

    // const user = await graphClient.api('/me').get();
    const calendars = await getUserCalendars(graphClient);
    const actualCalendar = calendars.find(
      (calendar) =>
        calendar?.name?.toLowerCase() === CALENDER_NAME.toLowerCase()
    );
    // await createEvent(graphClient, actualCalendar);
    const availabilities = await getUserAvailability(graphClient);
    console.log(
      "<<<<<<<WORKING HOUR",
      availabilities?.value[0].workingHours,
      "WORKING HOUR>>>>>>>>>>>"
    );
    // const auth = await getAuthorization(graphClient);

    // fs.writeFileSync('logs/json.log', JSON.parse(availabilities));

    // const client = Client.init({
    //   authProvider: async (done) => {
    //     try {
    //       const accessToken = await credential.getToken();
    //       done(null, accessToken.token);
    //     } catch (error) {
    //       logger.info('ERROR OCCUREDDDD>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    //       logger.error(error);
    //       done(error);
    //     }
    //   },
    // });

    // try {
    //   const me = await client.api('/me').get();

    //   // const token = await credential.getToken();

    //   logger.error('Access token:', me);
    // } catch (error) {
    //   logger.error(error);
    // }

    res.json({
      hello: "Hello world",
    });
    // Use the access token to make requests to Microsoft Graph API
  } else {
    // If no access token is found, initiate authentication
    authenticate(res);
  }
};
