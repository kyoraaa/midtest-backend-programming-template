const { attempt } = require("joi");

const usersSchema = {
  name: String,
  email: String,
  password: String,
  attempt: {type: Number, default: 0},
  time: Number
};

module.exports = usersSchema;
