const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const bankControllers = require('./bank-controller');
const bankValidator = require('./bank-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/transaction', route);

  // Get list of transaction
  route.get('/:rek', authenticationMiddleware, bankControllers.getTrans);

  //create transaction
  route.post(
    '/:rek',
    authenticationMiddleware,
    celebrate(bankValidator.transfer),
    bankControllers.transfer
  );

  route.put(
    '/:rek',
    authenticationMiddleware,
    celebrate(bankValidator.deposit),
    bankControllers.deposit
  );

  route.delete(
    '/:id',
    authenticationMiddleware,
    bankControllers.deleteTrans
  )


}