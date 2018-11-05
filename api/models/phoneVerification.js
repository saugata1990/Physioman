const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/physioman'

const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(url)

const VerificationSchema = new Schema({
    phone_no: String,
    otp: String
})

const Verification = db.model('Verification', VerificationSchema)
module.exports = Verification