"use strict";

const { callbackUpdateHandler } = require("./schedule.handler");

module.exports = async function (req, res) {
  if (req.query.validationToken) {
    // Respond to the validation request with the validation token
    console.log("Received subscription validation request.");
    res.status(200).send(req.query.validationToken);
  } else {
    // Handle other types of webhook notifications
    // console.log("Received webhook notification:", req.body);
    const data = req.body?.value[0]?.resourceData;
    console.log("Received webhook notification:", data);
    // Add your logic to handle the webhook notification here
    try {
      callbackUpdateHandler(data);
    } catch (e) {
      console.log("An error occured with webhook");
      console.log(e);
    }
    res.status(200).end();
  }
};
