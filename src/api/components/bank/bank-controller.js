const bankService = require('./bank-service');
const usersService = require('../users/users-service');


const { errorResponder, errorTypes } = require('../../../core/errors');

//get all transaction receipt berdasarkan rekening
async function getTrans(request, response, next) {
  try {
    const rek = request.params.rek;
    const transaction = await bankService.getTrans(rek);
    return response.json({ transaction });
    
  } catch (error) {
    return next(error);
  }
}


//Create berupa transfer dengan request isi body
//yang kita post adalah receipt nya
//yang kita update adalah user balance nya

//transfer terdapat 2 function
//fungsi 1 untuk createReceipt (post)
//fungsi 2 untuk transfer (update)
async function transfer(request, response, next){
  try{
    //ambil rek tujuan nominal
    const rek = request.params.rek;
    const rekening_tujuan = String(request.body.tujuan);
    const nominal = parseInt(request.body.nominal);
    
    //tidak boleh transfer <= 0
    if (nominal <= 0){
      throw errorResponder(
        errorTypes.INVALID_NOMINAL,
        'Nominal harus lebih dari 0'
      )
    }

    //cek apakah rek == tujuan
    if (rek == rekening_tujuan){
      throw errorResponder(
        errorTypes.INVALID_REK_SAMA,
        'Rekening asal dan tujuan sama'
      )
    }

    //cek rek asal apakah ada (isRek) 
    const isRekRegistered = await bankService.isRek(rek);
    if (!isRekRegistered) {
      throw errorResponder(
        errorTypes.INVALID_REK,
        'Rekening Asal tidak ditemukan'
      );
    }
    //cek rek tujuan apakah ada (isRek)
    const isRekTujuanRegistered = await bankService.isRek(rekening_tujuan);
    if (!isRekTujuanRegistered) {
      throw errorResponder(
        errorTypes.INVALID_REK,
        'Rekening Tujuan tidak ditemukan'
      );
    }
    
    //ambil balance berdasarkan rekening
    const rekBalance = await usersService.getBalance(rek);
    const tujuanBalance = await usersService.getBalance(rekening_tujuan);
    if (rekBalance < nominal){
      throw errorResponder(
        errorTypes.INVALID_SALDO,
        'Saldo Tidak Mencukupi'
      );
    }

    //untuk membuat receiptnya
    await bankService.createTransaction(rek,rekening_tujuan,nominal);
    

    //update saldo rek asal dan rek tujuan
    await bankService.updateBalance(rek,rekBalance-nominal);
    await bankService.updateBalance(rekening_tujuan,tujuanBalance+nominal);

    return response.json({rekening_tujuan,nominal: "Rp. "+nominal});
  }catch (error) {
    return next(error);
  }
}


//deposit balance
async function deposit(request, response, next){
  try{
    //mengambil rekening dari params, dan nominal dari body
    const rek = request.params.rek;
    const nominal = request.body.nominal;

    if(!await bankService.isRek(rek)){
      throw errorResponder(
        errorTypes.INVALID_REK,
        'Rekening tidak ditemukan'
      );
    }

    //update balance dari rek 
    const bal = await usersService.getBalance(rek);
    const success =  await bankService.updateBalance(rek,bal+nominal);

    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to Deposit'
      );
    }

    //buat receipt deposit
    await bankService.createDeposit(rek,nominal);
    
    return response.status(200).json({ rek, nominal });
    
  }catch (error) {
    return next(error);
  }
}

//untuk delete transaction berdasarkan parameter /:id
async function deleteTrans(request, response, next) {
  try {
    const id = request.params.id;
  
    const success = await bankService.deleteTrans(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTrans,
  transfer,
  deposit,
  deleteTrans

}