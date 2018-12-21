const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(process.env.mongo_url)

const transactionSchema = new Schema({
    transaction_type: String,
    transaction_amount: Number,
    payee: String,
    recipient: String, 
    timestamp: Date 
})

const Transaction = db.model('Transaction', transactionSchema)
module.exports = Transaction