const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/physioman'
const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(process.env.mongo_url)

const paymentSchema = new Schema({
    customer_id: String,
    booking_id: String,
    order_id: String,
    amount: Number,
    paid: Boolean
})

const Payment = db.model('Payment', paymentSchema)

module.exports = Payment