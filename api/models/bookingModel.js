const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/physioman'
const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(process.env.mongo_url)

const bookingSchema = new Schema({
    patient_id: String,   
    ailment_description: String,
    physio_gender_preference: String,
    consultation_fee: Number,
    session_fee: Number,
    consultation_fee_paid: Boolean,
    request_timestamp: Date,
    status: String,
    assigned_consultant: String,
    consultant_otp: String,
    assigned_physio: String,
    allotted_sessions: Number,
    number_of_sessions_unlocked: Number,
    payment_by_cash: Boolean,
    sessions_completed: Number,
    session_status: String,
    closed: Boolean,
    cancellation_requested: Boolean,
    reason_for_cancellation: String
})

const Booking = db.model('Booking', bookingSchema)

module.exports = Booking