const bankRepository = require('./bank-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const usersRepository = require('../users/users-repository');

async function getTrans() {
  const trans = await bankRepository.getTrans();

  const results = [];
  for (let i = 0; i < trans.length; i += 1) {
    const tran = trans[i];
    results.push({
      id: tran.id,
      name: tran.name,
      email: tran.email,
    });
  }
  return results;
}
//untuk mendapat data balance dari tiap rek
async function getBalance (rek){
  const user = await bankRepository.getBalance(rek);
  if (!user) {
    return null;
  }
  return {
    rek: user.rek,
    balance: user.balance
  };
}

module.exports = {
  getTrans,
  getBalance
};