const bankService = require('./bank-service');
const usersService = require('../users/users-service');


const { errorResponder, errorTypes } = require('../../../core/errors');

//get all transaction
async function getTrans(request, response, next) {
  try {
    const rek = request.params.rek;
    const trans = await bankService.getTrans(rek);
    return response.json({ trans });
    
  } catch (error) {
    return next(error);
  }
}

//Create berupa transfer dengan request isi body
//yang kita post adalah receipt nya
//yang kita update adalah user balance nya

//transfer disini ada 2 fungsi dalemnya
//fungsi 1 untuk createReceipt (post)
//fungsi 2 untuk transfer (update)
async function transfer(request, response, next){
  try{
    //ambil rek tujuan nominal
    const rek = request.params.rek;
    const tujuan = String(request.body.tujuan);
    const nominal = parseInt(request.body.nominal);
    
    //cek apakah rek == tujuan
    if (rek == tujuan){
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
    const isRekTujuanRegistered = await bankService.isRek(tujuan);
    if (!isRekTujuanRegistered) {
      throw errorResponder(
        errorTypes.INVALID_REK,
        'Rekening Tujuan tidak ditemukan'
      );
    }

    //untuk membuat receiptnya
    await bankService.createTransaction(rek,tujuan,nominal);
    
    // buat ngambil balance berdasarkan rekening
    const rekBalance = await usersService.getBalance(rek);
    const tujuanBalance = await usersService.getBalance(tujuan);

    //update saldo rek asal dan rek tujuan
    await bankService.updateBalance(rek,rekBalance-nominal);
    await bankService.updateBalance(tujuan,tujuanBalance+nominal);

    
    
    return response.json({tujuan,nominal: "Rp. "+nominal});
  }catch (error) {
    return next(error);
  }
}

module.exports = {
  getTrans,
  transfer,

}