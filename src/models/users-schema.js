const usersSchema = {
  rek: Number,
  name: String,
  email: String,
  password: String,
  attempt: {type: Number, default: 0},
  time: Number,
  balance: {type: Number, default: 0},
};

module.exports = usersSchema;

