const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/physioman'

const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(process.env.mongo_url)

const sessionSchema = new Schema({
    booking_id: String,
    session_otp: String,
    session_date: String,
    session_started: Boolean,
    session_ended: Boolean,
    patient_review: String,
    stars: Number,
    complaint: Boolean
})



const Session = db.model('Session', sessionSchema)

module.exports = Session