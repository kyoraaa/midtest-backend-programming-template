const bankService = require('./bank-service');
const usersService = require('../users/users-service');
const { getBalance } = require('./bank-repository');

const { errorResponder, errorTypes } = require('../../../core/errors');

//get all transaction
async function getTrans(request, response, next) {
  try {
    const balance = await bankService.getBalance(request.params.rek);
    if (!balance) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown rekening');
    }
    return response.json({balance});
  } catch (error) {
    return next(error);
  }
}

//create transaction
async function transfer(request, response, next){
  try{
    //access balance dulu by rek
    const balance = await usersService.getBalance(request.query.rek);
    if (!balance) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown rekening');
    }
    return response.json({balance});
  }catch (error) {
    return next(error);
  }
}

module.exports = {
  getTrans,
  transfer,
  getBalance

}