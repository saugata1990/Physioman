const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/physioman'
const Patient = require('./patientModel')
const Physio = require('./physioModel')
const Request = require('./requestModel')
const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(process.env.mongo_url)

const bookingSchema = new Schema({
    booked_for_patient: String,         
    assigned_physio: String,
    allotted_sessions: Number,
    sessions_completed: Number,
    session_status: String,
    booked_at: Date,
    booking_updated_at: Date,
    amount_payable: Number,
    closed: Boolean,
    cancellation_requested: Boolean,
    reason_for_cancellation: String
})

const Booking = db.model('Booking', bookingSchema)

module.exports = Booking