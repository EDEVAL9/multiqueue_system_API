const { msGraphAxios } = require("../utilities/axios.config");
const { getUserTimeZone } = require("../utilities/helpers.util");

const getUserCalendars = async (user) => {
  const calendars = await msGraphAxios(user?.msGraphAccessToken).get(
    "/me/calendars"
  );
  if (Array.isArray(calendars.data?.value)) {
    return calendars.data.value;
  }

  return [];
};

const getUserAvailability = async (client, startDate, endDate) => {
  const timezone = getUserTimeZone();
  const scheduleInformation = {
    schedules: ["chinedu_ukpe@outlook.com"],
    startTime: {
      dateTime: "2024-03-01T09:00:00",
      timeZone: timezone,
    },
    endTime: {
      dateTime: "2024-03-30T18:00:00",
      timeZone: timezone,
    },
    availabilityViewInterval: 60,
  };

  return await client.api("/me/calendar/getSchedule").post(scheduleInformation);
};

module.exports = {
  getUserCalendars,
  getUserAvailability,
};
