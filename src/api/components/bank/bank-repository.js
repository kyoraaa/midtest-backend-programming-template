const { Trans } = require('../../../models');
const { User } = require('../../../models');

async function getTrans() {
  return Trans.find({});
}

async function getBalance(rek){
  return User.findOne(rek);
}

//mengambil data transaksi dengan rekening tersebut


module.exports = {
  getTrans,
  getBalance
}