const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/physioman'
const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(url)

const incidentSchema = new Schema({
    action_route: String, 
    customer: String,
    priority: Number, // 1-->very high, 4-->low
    status: String, // new, processed
    timestamp: Date,
    incident_title: String,
    info: String
})

const Incident = db.model('Incident', incidentSchema)

module.exports = Incident