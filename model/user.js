const {Schema, model} = require("mongoose");

const UserSchema = new Schema({
    telegramid: {type: String},
    username: {type: String}
});

module.exports = model('User', UserSchema) 