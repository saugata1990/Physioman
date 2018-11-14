const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/physioman'

const Schema = mongoose.Schema
// mongoose.plugin(require('mongoose-regex-search'))
mongoose.Promise = global.Promise
const db = mongoose.createConnection(url)

const orderSchema = new Schema({   
    ordered_by: String, // patient_id
    ordered_items: [String], // product models
    items_purchased: [String], 
    items_rented: [String],  
    payable_amount: Number,
    payment_mode: String, // either online or cash on delivery
    order_timestamp: Date,
    processed: Boolean,
    delivery_otp: String,
    delivered: Boolean,
    rent_payable: Number,
    closed: Boolean,
    cancellation_requested: Boolean,
    reason_for_cancellation: String,
    comments: String  // remarks or complaints logged by the user
})


const Order = db.model('Order', orderSchema)

module.exports = Order

