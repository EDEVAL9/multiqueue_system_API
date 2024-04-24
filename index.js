'use strict';
const express = require('express');
const httpErrors = require('http-errors');
const pino = require('pino');
const pinoHttp = require('pino-http');
require('dotenv').config();
const cors = require('cors');
const schedule = require('node-schedule');
const { sendReminders } = require('./handlers/schedule.handler');
const httpProxy = require('http-proxy');
// const proxy = httpProxy.createProxyServer();

module.exports = function main(options, cb) {
  // Set default options
  const ready = cb || function () {};
  const opts = Object.assign(
    {
      // Default options
    },
    options
  );

  const logger = pino();

  // Server state
  let server;
  let serverStarted = false;
  let serverClosing = false;

  // Setup error handling
  function unhandledError(err) {
    // Log the errors
    logger.error(err);

    // Only clean up once
    if (serverClosing) {
      return;
    }
    serverClosing = true;

    // If server has started, close it down
    if (serverStarted) {
      server.close(function () {
        process.exit(1);
      });
    }
  }
  process.on('uncaughtException', unhandledError);
  process.on('unhandledRejection', unhandledError);

  // Create the express app
  const app = express();

  // Common middleware
  // app.use(/* ... */)
  app.use(express.json());
  // app.use(pinoHttp({ logger }));
  app.use(cors());

  // app.use('/', (req, res) => {
  //   proxy.web(req, res, {
  //     target: 'http://graph.microsoft.com',
  //     changeOrigin: true,
  //     // Add any additional proxy options and headers as needed
  //   });
  // });

  // Register routes
  // @NOTE: require here because this ensures that even syntax errors
  // or other startup related errors are caught logged and debuggable.
  // Alternativly, you could setup external log handling for startup
  // errors and handle them outside the node process.  I find this is
  // better because it works out of the box even in local development.
  require('./routes')(app, opts);

  // Common error handlers
  app.use(function fourOhFourHandler(req, res, next) {
    next(httpErrors(404, `Route not found: ${req.url}`));
  });
  app.use(function fiveHundredHandler(err, req, res, next) {
    if (err.status >= 500) {
      logger.error(err);
    }
    res.status(err.status || 500).json({
      messages: [
        {
          code: err.code || 'InternalServerError',
          message: err.message,
        },
      ],
    });
  });

  const job = schedule.scheduleJob('* * * * *', function () {
    console.log('The answer to life, the universe, and everything!');
    sendReminders();
  });

  // Start server
  server = app.listen(8000, '0.0.0.0', function (err) {
    if (err) {
      return ready(err, app, server);
    }

    // If some other error means we should close
    if (serverClosing) {
      return ready(new Error('Server was closed before it could start'));
    }

    serverStarted = true;
    const addr = server.address();
    logger.info(
      `Started at ${opts.host || addr.host || 'localhost'}:${addr.port}`
    );
    ready(err, app, server);
  });
};
