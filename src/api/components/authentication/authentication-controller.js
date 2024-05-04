const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');
const usersRepository = require('../users/users-repository');
const moment = require('moment');
/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;
  const users = await usersRepository.getUserByEmail(email);
  const currentTime =  moment().format('YYYY-MM-DD HH:mm:ss');
  //time dalam menit, jika terkena limit maka bs login lagi setelah time+30
  const time = Math.floor(Date.now() / 60000);

  try {
    // Check login credentials
    let attempt = users.attempt;
    let times = users.time
    //jika sdh melewati, maka attempt = 0
    if (times != null && times+1 <= time){
      await usersRepository.updateAttempt(email, 0);
      await usersRepository.updateTime(email, null);
      attempt = 0;
    }

    if (attempt < 5 ){
      var loginSuccess = await authenticationServices.checkLoginCredentials(
        email,
        password,
      );
      if (!loginSuccess) {
        if (attempt == 4){
          await usersRepository.updateTime(email, time);
          await usersRepository.updateAttempt(email, attempt+1);
          throw errorResponder(errorTypes.FORBIDDEN, "["+currentTime+"]"+" User "+ email + " gagal login. Attempt = "+ parseInt(attempt+1) + ". Limit reached");
          
        }
        await usersRepository.updateAttempt(email, attempt+1);
          return response.json("["+currentTime+"]"+" User "+ email + " gagal login. Attempt = "+ parseInt(attempt+1));
        
      }
      await usersRepository.updateAttempt(email, 0);
    }else{
      return response.json("["+currentTime+"]"+" User "+ email + " mencoba login, namun mendapat error 403 karena telah melebihi limit attempt.");
    }
    attempt = 0;
    return response.json({attempt});

  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
