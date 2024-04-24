const { Sequelize, DataTypes, Op } = require('sequelize');
const { sequelize } = require('../models');
const UserModel = require('../models/user');
const { msGraphAxios } = require('../utilities/axios.config');
const { default: axios } = require('axios');
const { createEvent } = require('../services/schedule.service');
const { getUserCalendars } = require('../services/calendar.service');
const schedules = require('../models/schedules');
const { getUserTimeZone } = require('../utilities/helpers.util');
const { STUDENT } = require('../utilities/constants');
const {
  sendReminderEmail,
  sendScheduleNotification,
  sendCancellationNotification,
} = require('../services/mail.service');
const UserInstance = UserModel(sequelize, DataTypes);

const ScheduleInstance = schedules(sequelize, DataTypes);

const getTutorSchedules = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      message: 'No ID specified',
    });
  }
  const user = await UserInstance.findOne({
    where: {
      [Op.or]: [{ email: id }, { id }],
    },
  });

  const startDate = new Date();

  const endDate = new Date();

  endDate.setDate(endDate.getDate() + 30);
  console.log(endDate);
  const timezone = getUserTimeZone();
  try {
    const schedules = await msGraphAxios(user?.msGraphAccessToken).get(
      `me/calendarView?startdatetime=${startDate.toISOString()}&enddatetime=${endDate.toISOString()}`
    );

    res.json({ data: schedules.data?.value });
  } catch (error) {
    console.log('FAILED TO LOAD DATA....', error);
    res.status(500).json({ data: [] });
  }
};

const createScheduleHandler = async (req, res) => {
  const { tutorId, event, studentId } = req.body;

  if (!tutorId || !studentId) {
    return res.status(400).json({ message: 'Invalid tutor or student' });
  }

  const tutor = await UserInstance.findByPk(tutorId);

  if (!tutor?.msGraphAccessToken) {
    return res.status(400).json({ message: 'Tutor not authorized' });
  }

  const student = await UserInstance.findByPk(studentId);

  if (!student) {
    return res.status(400).json({ message: 'Invalid student' });
  }

  const calendars = await getUserCalendars(tutor);

  const actualCalendar = calendars.find(
    (calendar) => calendar?.name?.toLowerCase() === 'calendar'
  );

  const newEventRes = await createEvent(tutor, actualCalendar, event, student);

  const systemEvent = await ScheduleInstance.create({
    MSCalendarEventId: newEventRes?.data?.id,
    studentId: student?.id,
    tutorId: tutor?.id,
    subject: event?.Subject,
    description: event?.Description,
    startTime: event?.StartTime,
    endTime: event?.EndTime,
    recurence: '',
    isAllDay: false,
    status: event?.status ?? 'BOOKED',
    MSCalendarEventId: newEventRes?.data?.id,
  });

  sendScheduleNotification(tutor, student, systemEvent);

  res.json(newEventRes.data);
};

const callbackUpdateHandler = async (data) => {
  if (!data) return console.log('No data');
  const resourceURL = data['@odata.id'];
  if (typeof resourceURL !== 'string') return console.log('INVALID RESPONSE');

  const splitOne = resourceURL.toLowerCase().split('users/');

  if (!splitOne[1]) return console.log('INVALID RESPONSE');

  const split2 = splitOne[1].toLowerCase().split('/event');

  const userId = split2[0];

  if (!userId) return console.log('INVALID RESPONSE');

  const tutor = await UserInstance.findOne({
    where: {
      msGraphUserId: userId,
    },
  });

  if (!tutor) return console.log('Tutor not found for webhook');

  let resource;
  try {
    resource = await msGraphAxios(tutor?.msGraphAccessToken).get(resourceURL);

    const changedSchedule = resource?.data;

    if (changedSchedule?.showAs === 'busy') {
      const where = {
        [Op.and]: [
          {
            tutorId: tutor?.id,
          },
          {
            startTime: {
              [Op.between]: [
                changedSchedule?.start?.dateTime,
                changedSchedule?.end?.dateTime,
              ],
            },
          },
          {
            MSCalendarEventId: {
              [Op.not]: resource?.data?.id,
            },
          },
        ],
      };

      const availableSchedule = await ScheduleInstance.findAll({
        where,
      });

      for (let availability of availableSchedule) {
        const availabilityTutor = await UserInstance.findByPk(
          availability?.tutorId
        );
        const availabilityStudent = await UserInstance.findByPk(
          availability?.studentId
        );

        sendCancellationNotification(
          availabilityTutor,
          availabilityStudent,
          availability
        );
      }

      ScheduleInstance.update(
        { status: 'CANCELLED' },
        {
          where,
        }
      );
    }
  } catch (error) {
    console.log(error);
  }

  // if (!availableSchedule) {
  //   console.log("No schedule found for update");
  //   return;
  // }
};

const getStudentScheduleHandler = async (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.json([]);
  }

  const user = await UserInstance.findOne({
    where: {
      email,
    },
  });

  // if (user?.accountType !== STUDENT) {
  //   return res.json([]);
  // }

  if (!user) {
    console.log('User with email not found');
    return res.json([]);
  }

  console.log('IDDDD', user?.id);

  const schedules = await ScheduleInstance.findAll({
    where: {
      studentId: user?.id,
    },
    include: ['tutor'],
  });

  res.json(schedules);
};

const sendReminders = async () => {
  const currentTime = new Date();
  // Add 30 minutes to the current time
  const thirtyMinutesLater = new Date(currentTime.getTime() + 30 * 60000);
  const schedulesToRemind = await ScheduleInstance.findAll({
    where: {
      [Op.and]: [
        {
          startTime: {
            [Op.between]: [currentTime, thirtyMinutesLater],
          },
        },
        {
          reminderSent: false,
        },
        {
          status: 'BOOKED',
        },
      ],
    },
  });

  for (let schedule of schedulesToRemind) {
    const tutor = await UserInstance.findByPk(schedule?.tutorId);
    const student = await UserInstance.findByPk(schedule?.studentId);

    sendReminderEmail(tutor, student, schedule);

    await ScheduleInstance.update(
      {
        reminderSent: true,
      },
      {
        where: {
          id: schedule?.id,
        },
      }
    );
  }
};

module.exports = {
  getTutorSchedules,
  createScheduleHandler,
  callbackUpdateHandler,
  getStudentScheduleHandler,
  sendReminders,
};
