const mongoose = require('mongoose')
const { mongo_url } = require('../config/keys')
const url = 'mongodb://localhost:27017/physioman'

const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(mongo_url)

const VerificationSchema = new Schema({
    phone_no: String,
    otp: String
})

const Verification = db.model('Verification', VerificationSchema)
module.exports = Verification