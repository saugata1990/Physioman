const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/physioman'
// const Physio = require('./physioModel')
const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(url)

const patientSchema = new Schema({
    patient_id: String, // unique, same as the phone number used to register
    password_hash: String,
    patient_name: String,
    patient_gender: String,
    patient_dob: Date, 
    patient_email: String,
    email_verified: Boolean,
    patient_phone: String,
    patient_address: String,
    ailment_history: String,
    bookings: [String],
    orders: [String],
    assigned_physio: String,
    date_joined: Date,
    first_session_date: Date,
    last_session_date: Date,
    total_number_of_sessions: Number
})


const Patient = db.model('Patient', patientSchema)

module.exports = Patient