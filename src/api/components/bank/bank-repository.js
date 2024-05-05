const { Trans } = require('../../../models');
const { User } = require('../../../models');
const moment = require('moment');


async function getTrans() {
  return Trans.find({});
}

//create transaction
async function createTransaction(rek,tujuan,nominal){
  return Trans.create({
    rek,
    tujuan,
    nominal,
    tanggal:moment().format('YYYY-MM-DD HH:mm:ss')
  });
}

//mengupdate saldo
async function updateBalance(rek,nominal){
  return User.updateOne(
    {
      rek: rek,
    },
    {
      $set: {
        balance: nominal,
      },
    }
  )
}


module.exports = {
  getTrans,
  createTransaction,
  updateBalance
}