const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/physioman'
const Patient = require('./patientModel')
const Physio = require('./physioModel')
const Request = require('./requestModel')
const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(url)

const bookingSchema = new Schema({
    booked_for_patient: String,         // patient_id
    assigned_physio: String,
    allotted_sessions: Number,
    sessions_completed: Number,
    booked_at: Date,
    booking_updated_at: Date,
    payment_mode: String,
    closed: Boolean,
    cancellation_requested: Boolean,
    reason_for_cancellation: String
})

const Booking = db.model('Booking', bookingSchema)

module.exports = Booking