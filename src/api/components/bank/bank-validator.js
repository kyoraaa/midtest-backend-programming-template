const { param } = require('express/lib/router');
const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  transfer: {
    body: {
      tujuan: joi.string().min(9).max(9).label("Tujuan").required(),
      nominal: joi.number().min(1).label("Nominal").required()
    }
  },
  deposit: {
    body: {
      nominal: joi.number().min(1).label("Nominal").required()
    }
  }
}