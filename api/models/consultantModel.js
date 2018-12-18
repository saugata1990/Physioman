const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/physioman'
const Request = require('./requestModel') 
const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(process.env.mongo_url)

const consultantSchema = new Schema({
    consultant_id: String,
    consultant_name: String,
    isPhysio: Boolean,
    consultant_email: String,
    consultant_gender: String,
    consultant_phone: String, // unique
    password_hash: String,
    date_joined: Date,
    last_consultation_date: Date,
    number_of_consultations: Number,
    pending_consultations: Number,
    patients_to_visit: [String],
    terminated: Boolean,
    wallet_amount: 0
})

const Consultant = db.model('Consultant', consultantSchema)
module.exports = Consultant