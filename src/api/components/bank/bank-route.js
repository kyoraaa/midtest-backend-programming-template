const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const bankControllers = require('./bank-controller');
const bankValidator = require('./bank-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/transaction', route);

  // Get list of transaction
  route.get('/:id', authenticationMiddleware, bankControllers.getTrans);

  route.post(
    '/:id',
    authenticationMiddleware,
    bankControllers.transfer
  );


}