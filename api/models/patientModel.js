const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/physioman'
const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(process.env.mongo_url)

const patientSchema = new Schema({
    password_hash: String,
    patient_name: String,
    patient_gender: String,
    patient_dob: Date, 
    patient_email: String,
    email_verified: Boolean,
    patient_phone: String,
    patient_address: String,
    patient_location: {lat: Number, long: Number},
    address_updated: Boolean,
    ailment_history: [{date: Date, description: String}],
    bookings: [String],
    orders: [String],
    assigned_physio: String,
    date_joined: Date,
    first_session_date: Date,
    last_session_date: Date,
    total_number_of_sessions: Number,
    wallet_amount: Number
})


const Patient = db.model('Patient', patientSchema)

module.exports = Patient