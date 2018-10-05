const express = require('express')
const sessions = express.Router()
const {sendSMSmock, generateOTP, verifyToken} = require('../utils/helper')
const Request = require('../models/requestModel')
const Booking = require('../models/bookingModel')
const Session = require('../models/sessionModel')
const Physio = require('../models/physioModel')
const date = require('date-and-time')
const { patient_secret_key, admin_secret_key, physio_secret_key } = require('../config/keys')


// to be used by physio before each session 
sessions.post('/:booking_id/sendOTP', verifyToken(physio_secret_key), (req, res) => {
    let otp = generateOTP()
    Booking.findOne({_id: req.params.booking_id}).exec()
    .then((booking) => {
        if(booking){
            booking.session_status = 'otp sent'
            return Promise.all([
                new Session({
                    patient_id: req.body.patient_id,
                    physio_id: req.body.physio_id,
                    session_date: new Date(),
                    session_started: false,
                    session_ended: false,
                    session_otp: otp
                }).save(),
                booking.save()
            ])
            .then(() => {
                sendSMSmock(booking.booked_for_patient, otp)
                res.status(200).json({message: otp})
            })
        }
    })
    .catch(error => res.status(500).json({error}))
})

// to be used by physio before starting a session(might require changes)
sessions.post('/start-session', verifyToken(physio_secret_key), (req, res) => {
    Session.findOne({session_otp: req.body.otp}).exec()
    .then((session) => {
        if(!session){
            res.status(403).json({message: 'invalid OTP'})
        } 
        else{
            Booking.findOne({_id: session.booking_id}).exec()
            .then(booking => {
                session.session_started = true
                booking.session_status = 'started'
                return Promise.all([
                    session.save(),
                    booking.save()
                ])
                .then(() => res.status(200).json({message: 'Session started'}))
            })     
        }
    })
    .catch(error => res.status(500).json({error}))
})

// to be used by physio to end session(might require changes)
sessions.post('/end-session/:session_id', verifyToken(physio_secret_key), (req, res) => {
    Session.findOne({_id: req.params.session_id}).exec()
    .then((session) => {
        Booking.findOne({_id: session.booking_id}).exec()
        .then(booking => {
            booking.session_status = 'not started'
            booking.sessions_completed++
            booking.session_otp_sent = false
            session.session_started = false
            session.session_ended = true
            Physio.findOne({physio_id: booking.assigned_physio}).exec()
            .then(physio => {
                physio.ratings = (physio.ratings * physio.sessions_completed + 4) / physio.sessions_completed
                return Promise.all([
                    session.save(),
                    booking.save(),
                    physio.save()
                ])
                .then(() => res.status(200).json({message: 'session ended'}))
            })
        })
    })
    .catch(error => res.status(500).json({error}))
})

// to be used by patient.. changes required
// sessions.post('/feedback/:session_id', verifyToken(patient_secret_key), (req, res) => {
//     Session.findOne({_id: req.params.session_id}).exec()
//     .then((session) => {
//         Physio.findOne({physio_id: session.physio_id}).exec()
//         .then(physio => {
//             session.patient_review = req.body.feedback
//             session.stars = req.body.stars
//             session.complaint = req.body.complaint
//             physio.ratings = (physio.ratings * physio.sessions_completed - 4 + session.stars) / physio.sessions_completed
//             return Promise.all([
//                 session.save(),
//                 physio.save()
//             ])
//             .then(() => res.status(200).json({message: 'feedback posted'}))
//         })
//     })
//     .catch(error => res.status(500).json({error}))
// })




module.exports = sessions