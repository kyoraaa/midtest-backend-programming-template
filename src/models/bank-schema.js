const transactionSchema = {
  rek: String,
  tanggal: {type: String, default: null},
  tujuan: String,
  nominal: Number
};

module.exports = transactionSchema;