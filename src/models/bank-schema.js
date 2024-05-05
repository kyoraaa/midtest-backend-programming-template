const transactionSchema = {
  rek: String,
  tanggal: {type: String, default: null},
  tujuan: String,
  nominal: Number,
  jenis:String
};

module.exports = transactionSchema;