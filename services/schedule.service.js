const { msGraphAxios } = require('../utilities/axios.config');
const { getUserTimeZone } = require('../utilities/helpers.util');

const createSubscription = async (graphClient) => {
  const currentDate = new Date();
  currentDate.setMinutes(10000);
  const subscription = {
    changeType: 'updated,deleted',
    notificationUrl: process.env.WEBHOOK_URL,
    lifecycleNotificationUrl: process.env.WEBHOOK_URL,
    resource: `/me/calendar/events`,
    expirationDateTime: currentDate.toISOString(),
    clientState: process.env.WEBHOOK_SECRET,
  };

  const newsub = await graphClient.api('/subscriptions').post(subscription);

  const allSUb = await graphClient.api('/subscriptions').get();

  console.log(allSUb);
};

const createEvent = async (user, calendar, eventData, student) => {
  console.log(eventData, 'EVENT DATA>>>>');
  const timeZone = getUserTimeZone();
  const event = {
    subject: eventData?.Subject,
    body: {
      contentType: 'HTML',
      content: eventData?.Description ?? '',
    },
    start: {
      dateTime: eventData?.StartTime,
      timeZone,
    },
    end: {
      dateTime: eventData?.EndTime,
      timeZone,
    },
    location: {
      displayName: 'Office meeting',
    },
    attendees: [
      {
        emailAddress: {
          address: student?.email,
          name: `${student?.lastName} ${student?.firstName}`,
        },
        type: 'required',
      },
    ],
    transactionId: `7E163156-7762-4BEB-A1C6-729${Math.floor(
      Math.random() * 100000
    )}`,
  };
  return await msGraphAxios(user?.msGraphAccessToken).post(
    `/me/calendars/${calendar?.id}/events`,
    event
  );
};

module.exports = {
  createSubscription,
  createEvent,
};
