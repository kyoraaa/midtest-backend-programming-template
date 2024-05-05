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
        id: tran.id,
        tanggal: tran.tanggal,
        jenis: tran.jenis,
        rekening: tran.rek,
        tujuan: tran.tujuan,
        nominal: "Rp. " + tran.nominal,
      });
    }
  }
  return results;
}

//untuk membuat receipt transfer
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

//untuk membuat receipt deposit
async function createDeposit(rek,nominal){
  try{
    const x = await bankRepository.createDeposit(rek, nominal);
    if (!x){
      return false;
    }
    return true;
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
      'Rekening tidak ditemukann!'
    );
  }
  await bankRepository.updateBalance(rek,nominal);
  }catch(err){
    return null;
  }
  return true;
}

async function deleteTrans(id) {
  const user = await bankRepository.getTran(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await bankRepository.deleteTrans(id);
  } catch (err) {
    return null;
  }

  return true;
}

module.exports = {
  getTrans,
  isRek,
  createTransaction,
  updateBalance,
  createDeposit,
  deleteTrans
};