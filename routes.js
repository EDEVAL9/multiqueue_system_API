'use strict';
const simple = require('./handlers/simple');
const configured = require('./handlers/configured');
const notificaton = require('./handlers/webhook.notification');
const {
  registerUserHandler,
  loginHandler,
  authorizeMSGraphHandler,
} = require('./handlers/auth.handler');
const { searchTutorHandler } = require('./handlers/tutor.handler');
const {
  getSingleUserHandler,
  getSingleUserByIdHandler,
} = require('./handlers/user.handler');
const {
  getTutorSchedules,
  createScheduleHandler,
  getStudentScheduleHandler,
} = require('./handlers/schedule.handler');

module.exports = function (app, opts) {
  // Setup routes, middleware, and handlers
  app.get('/', (req, res) => res.json({ message: 'OK' }));
  app.get('/authorized', simple);
  app.post('/webhook', notificaton);
  app.get('/configured', configured(opts));
  app.post('/auth/register', registerUserHandler);
  app.post('/auth/login', loginHandler);
  app.get('/tutors/search', searchTutorHandler);
  app.get('/users/:id', getSingleUserByIdHandler);
  app.get('/users/email/:email', getSingleUserHandler);
  app.post('/ms-graph/authorize', authorizeMSGraphHandler);
  app.get('/tutor/:id/get-availability', getTutorSchedules);
  app.post('/student/create-appointment', createScheduleHandler);
  app.get('/student/schedules/:email', getStudentScheduleHandler);
};
