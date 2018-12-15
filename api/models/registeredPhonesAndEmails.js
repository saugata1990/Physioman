const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/physioman'

const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(process.env.mongo_url)

const phoneAndEmailSchema = new Schema({
    registered_phone_number: String,
    registered_email: String
})

const PhoneAndEmail = db.model('PhoneAndEmail', phoneAndEmailSchema)

module.exports = PhoneAndEmail