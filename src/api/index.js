const express = require('express');

const authentication = require('./components/authentication/authentication-route');
const users = require('./components/users/users-route');
const trans = require('./components/bank/bank-route');


module.exports = () => {
  const app = express.Router();

  authentication(app);
  users(app);
  trans(app);

  return app;
};
