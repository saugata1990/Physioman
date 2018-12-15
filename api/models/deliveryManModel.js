const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/physioman'

const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(process.env.mongo_url)

const DeliveryManSchema = new Schema({
    user_id: String,
    password_hash: String,
    name: String
})

const DeliveryMan = db.model('DeliveryMan', DeliveryManSchema)
module.exports = DeliveryMan