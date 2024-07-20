const {Schema, model} = require("mongoose");

const CardsSchema = new Schema({
    question: {type: String},
    correct: {type: String},
    incorrect: {type: String},
    incorrect1: {type: String},
    incorrect2: {type: String},
    number: {type: String},

});

module.exports = model('Cards', CardsSchema) 