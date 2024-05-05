const { Trans } = require('../../../models');
const { User } = require('../../../models');
const moment = require('moment');


//untuk menampilkan semua transaksi
async function getTrans() {
  return Trans.find({});
}

//mengambil transaksi berdasarkan id
async function getTran(id){
  return Trans.findById(id);
}

//create transaction untuk transfer
async function createTransaction(rek, tujuan, nominal) {
  return Trans.create({
    rek,
    tujuan,
    nominal,
    tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
    jenis: "Transfer", 
  });
}

//membuat receipt deposit
async function createDeposit(rek, nominal) {
  return Trans.create({
    tanggal: moment().format('YYYY-MM-DD HH:mm:ss'),
    rek,
    nominal,
    jenis: "Deposit"
  });
}

//mengupdate saldo
async function updateBalance(rek, nominal) {
  return User.updateOne(
    {
      rek: rek,
    },
    {
      $set: {
        balance: nominal,
      },
    }
  );

}

//menghapus saldo berdasarkan id
async function deleteTrans(id) {
  return Trans.deleteOne({ _id: id });
} 

module.exports = {
  getTrans,
  createTransaction,
  updateBalance,
  createDeposit,
  getTran,
  deleteTrans
};
