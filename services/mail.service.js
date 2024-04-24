const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

console.log(
  process.env.MAIL_PASSWORD,
  process.env.MAIL_USER,
  process.env.MAIL_PORT,
  process.env.MAIL_HOST
);
const sendReminderEmail = async (tutor, student, schedule) => {
  const info = await transporter.sendMail({
    from: '"no-reply" <no-reply@schedulesystem.io>',
    to: tutor?.email,
    subject: 'Schedule reminder',
    html: `<h4>Hello ${tutor?.lastName}</h4>
    <p> This is to remind you that your meeting with ${student?.lastName} ${student?.firstName} starts in 30 minutes</p>
    <p> The agender for the meeting is: ${schedule?.subject}</p>
    <p> </p>
    <p> Best, </p>
    <p> Automation System. </p>
    `,
  });

  const info2 = await transporter.sendMail({
    from: '"no-reply" <no-reply@schedulesystem.io>',
    to: student?.email,
    subject: 'Schedule reminder',
    html: `<h4>Hello ${student?.lastName}</h4>
    <p> This is to remind you that your meeting with ${tutor?.lastName} ${tutor?.firstName} starts in 30 minutes</p>
    <p> The agender for the meeting is: ${schedule?.subject}</p>
    <p> </p>
    <p> Best, </p>
    <p> Automation System. </p>
    `,
  });
};

const sendCancellationNotification = async (tutor, student, schedule) => {
  await transporter.sendMail({
    from: '"no-reply" <no-reply@schedulesystem.io>',
    to: tutor?.email,
    subject: 'Appointment cancellation',
    html: `<h4>Hello ${tutor?.lastName}</h4>
    <p> This is to notify you that your meeting with ${student?.lastName} ${student?.firstName} has been cancelled.</p>
    <hr />
    <p> The agender for the meeting is: ${schedule?.subject}</p>
    <p>{schedule?.description} </p>
    <p> Schedule Date: ${schedule?.startTime}</p>
    <hr />
    <p> </p>
    <p> Best, </p>
    <p> Automation System. </p>
    `,
  });

  await transporter.sendMail({
    from: '"no-reply" <no-reply@schedulesystem.io>',
    to: student?.email,
    subject: 'New Schedule Notification',
    html: `<h4>Hello ${student?.lastName}</h4>
    <p> This is to notify you that your meeting with  ${tutor?.lastName} ${tutor?.firstName} has been cancelled.</p>
    <p> The agender for the meeting is: ${schedule?.subject}</p>
    <p>${schedule?.description}</p>
    <p> Schedule Date: ${schedule?.startTime}</p>
    <p> </p>
    <p> Best, </p>
    <p> Automation System. </p>
    `,
  });
};

const sendScheduleNotification = async (tutor, student, schedule) => {
  await transporter.sendMail({
    from: '"no-reply" <no-reply@schedulesystem.io>',
    to: tutor?.email,
    subject: 'New Schedule Notification',
    html: `<h4>Hello ${tutor?.lastName}</h4>
    <p> This is to notify you that a meeting has been scheduled on your calendar with ${student?.lastName} ${student?.firstName}.</p>
    <p> The agender for the meeting is: ${schedule?.subject}</p>
    <p> Schedule Date: ${schedule?.startTime}</p>
    <p> </p>
    <p> Best, </p>
    <p> Automation System. </p>
    `,
  });

  await transporter.sendMail({
    from: '"no-reply" <no-reply@schedulesystem.io>',
    to: student?.email,
    subject: 'New Schedule Notification',
    html: `<h4>Hello ${student?.lastName}</h4>
    <p> This is to notify you that a meeting has been scheduled on your calendar with  ${tutor?.lastName} ${tutor?.firstName}.</p>
    <p> The agender for the meeting is: ${schedule?.subject}</p>
    <p> Schedule Date: ${schedule?.startTime}</p>
    <p> </p>
    <p> Best, </p>
    <p> Automation System. </p>
    `,
  });
};

const sendWelcomeEmail = async (user, password) => {
  await transporter.sendMail({
    from: '"no-reply" <no-reply@schedulesystem.io>',
    to: user?.email,
    subject: 'Welcome Email',
    html: `<h4>Hello ${user?.lastName}</h4>
    <p> You have been invited to the scheduling syste.</p>
    <p> Please find your one time password below:</p>
    <p> Password: <b>${password} </b></p>
    <p> </p>
    <p> Best, </p>
    <p> Automation System. </p>
    `,
  });
};

module.exports = {
  sendReminderEmail,
  sendScheduleNotification,
  sendWelcomeEmail,
  sendCancellationNotification,
};
