const express = require('express')
const sessions = express.Router()
const {sendSMSmock, generateOTP, verifyToken} = require('../utils/helper')
const Request = require('../models/requestModel')
const Booking = require('../models/bookingModel')
const Session = require('../models/sessionModel')
const Physio = require('../models/physioModel')
const Patient = require('../models/patientModel')
const date = require('date-and-time')



sessions.get('/otp', verifyToken(process.env.patient_secret_key), (req, res) => {
    Booking.findOne({session_status: 'otp sent'}).exec()
    .then(booking => {
        Session.findOne({booking_id: booking._id, session_ended: false}).exec()
        .then(session => res.status(200).json({otp: session.session_otp}))
    })
    .catch(error => res.status(500).json({error}))
})

// to be used by physio before each session 
sessions.post('/sendOTP/:booking_id', verifyToken(process.env.physio_secret_key), (req, res) => {
    let otp = generateOTP()
    return Promise.all([
        Booking.findOne({_id: req.params.booking_id}).exec(),
        Session.findOne({booking_id: req.params.booking_id, session_ended: false}).exec(),
        Patient.findOne({bookings: req.params.booking_id}).exec()
    ])
    .then(([booking, session, patient]) => {
        if(!session){
            session = new Session({
                booking_id: req.params.booking_id,
                session_otp: otp,
                session_date: new Date(),
                session_started: false,
                session_ended: false
            })
        }
        else{
            session.session_otp = otp
        }
        booking.session_status = 'otp sent'
        return Promise.all([
            session.save(),
            booking.save()
        ])
        .then(() => {
            sendSMSmock(patient.patient_phone, otp)
            res.status(200).json({session})
        })
    })
    .catch(error => res.status(500).json({error}))
})


sessions.post('/start-session/:booking_id', verifyToken(process.env.physio_secret_key), (req, res) => {
    return Promise.all([
        Booking.findOne({_id: req.params.booking_id}).exec(),
        Session.findOne({booking_id: req.params.booking_id, session_ended: false}).exec()
    ])
    .then(([booking, session]) => {
        if(session.session_otp === req.body.otp){
            session.session_started = true
            booking.session_status = 'started'
            return Promise.all([
                session.save(),
                booking.save()
            ])
            .then(() => res.status(200).json({message: 'Session started'}))
        }
        else{
            res.status(403).json({message: 'Invalid OTP'})
        }
    })
    .catch(error => res.status(500).json({error}))
})



// to be used by physio to end session(might require changes)
sessions.post('/end-session/:session_id', verifyToken(process.env.physio_secret_key), (req, res) => {
    Session.findOne({_id: req.params.session_id}).exec()
    .then((session) => {
        return Promise.all([
            Booking.findOne({_id: session.booking_id}).exec(),
            Patient.findOne({bookings: session.booking_id}).exec()
        ])
        .then(([booking, patient]) => {
            booking.session_status = 'not started'
            booking.sessions_completed++
            booking.closed = booking.sessions_completed === booking.allotted_sessions ? true : false
            booking.session_otp_sent = false
            if(patient.total_number_of_sessions === 0){
                patient.first_session_date = session.session_date
            }
            patient.last_session_date = session.session_date
            patient.total_number_of_sessions++
            session.session_started = false
            session.session_ended = true
            Physio.findOne({_id: booking.assigned_physio}).exec()
            .then(physio => {
                physio.merit_points++
                physio.rating = (physio.rating * physio.sessions_completed + 4) / ++physio.sessions_completed
                return Promise.all([
                    session.save(),
                    booking.save(),
                    patient.save(),
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