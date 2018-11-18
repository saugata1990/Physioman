const express = require('express')
const incidents = express.Router()
const Incident = require('../models/incidentModel')
const { verifyToken } = require('../utils/helper')
const { admin_secret_key } = require('../config/keys')

incidents.get('/',  (req, res) => {   //verifyToken(admin_secret_key),
    Incident.find(req.query).sort({_id: -1}).exec()  // change sort key to timestamp
    .then(incidents => res.status(200).json({incidents}))
    .catch(error => res.status(500).json({error}))
})

incidents.get('/:incident_id', (req, res) => {
    Incident.findOne({_id: req.params.incident_id}).exec() 
    .then(incident => res.status(200).json({incident}))
    .catch(error => res.status(500).json({error}))
})

module.exports = incidents