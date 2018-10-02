const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/physioman'

const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(url)

const adminSchema = new Schema({
    admin_id: String,
    password_hash: String,
    admin_email: String,
    admin_phone: String
    
})

const Admin = db.model('Admin', adminSchema)

module.exports = Admin