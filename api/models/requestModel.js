const mongoose = require('mongoose')
const { mongo_url } = require('../config/keys')
const url = 'mongodb://localhost:27017/physioman'
const Consultant = require('../models/consultantModel')
const Patient = require('../models/patientModel')
const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(mongo_url)

const requestSchema = new Schema({
    requested_by_patient: String,
    ailment_description: String,
    physio_gender_preference: String,
    consultation_payment_mode: String, 
    booking_amount_payable: Number,
    booking_amount_received: Number,
    request_timestamp: Date,
    serviced_by: String, //admin id
    serviced_at: Date,
    mapped_consultant: String,
    consultant_otp: String,
    sessions_fixed_by_consultant: Number, 
    processed_by_consultant: Boolean,
    ready_for_booking: Boolean,
    closed: Boolean,
    cancellation_requested: Boolean,
    reason_for_cancellation: String
})


const Request = db.model('Request', requestSchema)

module.exports = Request