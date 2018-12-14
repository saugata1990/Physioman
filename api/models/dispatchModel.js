const mongoose = require('mongoose')
const { mongo_url } = require('../config/keys')
const url = 'mongodb://localhost:27017/physioman'

const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(mongo_url)

const dispatchSchema = new Schema({
    order: String,
    dispatch_type: String, // delivery or return
    products_to_deliver: [{product: String, sale_type: String}],
    products_to_collect: [String],
    amount_to_collect: Number,
    done: Boolean
})

const Dispatch = db.model('Dispatch', dispatchSchema)
module.exports = Dispatch

