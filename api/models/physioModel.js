const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/physioman'
const Patient = require('./patientModel')
const Review = require('./reviewModel') 
const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(process.env.mongo_url)

const physioSchema = new Schema({
    physio_id: String, // unique
    password_hash: String,
    physio_name: String,
    physio_email: String, // unique
    physio_phone: String, // unique
    physio_gender: String,
    physio_dob: Date, 
    date_joined: Date,
    last_session_date: Date,
    isConsultant: Boolean,
    current_patients: [String],
    number_of_patients: Number, 
    gps_enabled: Boolean,
    current_location: String, // location data
    sessions_completed: Number,
    demerit_points: Number,
    terminated: Boolean,
    rating: Number
})

const Physio = db.model('Physio', physioSchema)

module.exports = Physio