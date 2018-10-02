const express = require('express')
const sessions = express.Router()
// const crypto = require('crypto')
const {sendSMSmock, generateOTP, verifyToken} = require('../utils/helper')
const Request = require('../models/requestModel')
const Booking = require('../models/bookingModel')
const Session = require('../models/sessionModel')
const Physio = require('../models/physioModel')
const date = require('date-and-time')
const { patient_secret_key, admin_secret_key } = require('../config/keys')


// to be used by physio before each session
sessions.post('/sendOTP', (req, res) => {
    let otp = generateOTP()
    Booking.findOne({booked_for_patient: req.body.patient_id}).exec()
    .then((booking) => {
        if(booking){
            new Session({
                patient_id: req.body.patient_id,
                physio_id: req.body.physio_id,
                session_date: date.format(new Date(), 'DD-MM-YYYY'),
                session_started: false,
                session_ended: false,
                session_otp: otp
            }).save()
            .then(() => {
                sendSMSmock(booking.booked_for_patient, otp)
                res.status(200).json({messge: otp})
            })
        }
    })
    .catch(error => res.status(500).json(error))
})

// to be used by physio before starting a session
sessions.post('/start-session', (req, res) => {
    Session.findOne({patient_id: req.body.patient_id}).exec()
    .then((session) => {
        if(session.session_otp !== req.body.otp){
            res.status(403).json({messge: 'invalid OTP'})
        } 
        else{
            session.session_started = true
            session.save()
            .then(() => res.status(200).json({messge: 'Session started'}))     
        }
    })
    .catch(error => res.status(500).json(error))
})

// to be used by physio to end session
sessions.post('/end-session/:session_id', (req, res) => {
    Session.findOne({_id: req.params.session_id}).exec()
    .then((session) => {
        Physio.findOne({physio_id: session.physio_id}).exec()
        .then(physio => {
            physio.sessions_completed++
            physio.ratings = (physio.ratings * physio.sessions_completed + 4) / physio.sessions_completed
            session.session_started = false
            session.session_ended = true
            return Promise.all([
                session.save(),
                physio.save()
            ])
            .then(() => res.status(200).json({messge: 'session ended'}))
        })
    })
    .catch(error => res.status(500).json(error))
})

// to be used by patient
sessions.post('/feedback/:session_id', (req, res) => {
    Session.findOne({_id: req.params.session_id}).exec()
    .then((session) => {
        Physio.findOne({physio_id: session.physio_id}).exec()
        .then(physio => {
            session.patient_review = req.body.feedback
            session.stars = req.body.stars
            session.complaint = req.body.complaint
            physio.ratings = (physio.ratings * physio.sessions_completed - 4 + session.stars) / physio.sessions_completed
            return Promise.all([
                session.save(),
                physio.save()
            ])
            .then(() => res.status(200).json({messge: 'feedback posted'}))
        })
    })
    .catch(error => res.status(500).json(error))
})




module.exports = sessions