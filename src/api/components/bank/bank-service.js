const bankRepository = require('./bank-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const usersRepository = require('../users/users-repository');

async function getTrans(rek) {
  const trans = await bankRepository.getTrans();
  
  const results = [];
  for (let i = 0; i < trans.length; i += 1) {
    const tran = trans[i];
    if (tran.rek === rek){
      results.push({
        rek: tran.rek,
        tanggal: tran.tanggal,
        tujuan: tran.tujuan,
        nominal: tran.nominal
      });
    }
  }
  return results;
}

//untuk membuat receipt
async function createTransaction(rek,tujuan,nominal){
  try{
    const x = await bankRepository.createTransaction(rek, tujuan, nominal);
    if (!x){
      return false;
    }
  }catch(err){
    return false;
  }
}

//untuk mengecek keberadaan rekening
async function isRek(rek){
    const user = await usersRepository.getUserByRek(rek);
    if (user) {
      return true;
    }
  
    return false;
}


//mengupdate balance rek asal dan tujuan
async function updateBalance(rek, nominal){
  try{
  const user = await usersRepository.getUserByRek(rek);
  if (!user) {
    throw errorResponder(
      errorTypes.INVALID_REK,
      'Rek tidak ditemukann!'
    );
  }
    await bankRepository.updateBalance(rek,nominal);
  }catch(err){
    return null;
  }
  return true;
}

module.exports = {
  getTrans,
  isRek,
  createTransaction,
  updateBalance

};