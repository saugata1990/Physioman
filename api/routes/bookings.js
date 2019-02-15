const express = require('express')
const bookings = express.Router()
const Booking = require('../models/bookingModel')
const Physio = require('../models/physioModel')
const Patient = require('../models/patientModel')
const Consultant = require('../models/consultantModel')
const Incident = require('../models/incidentModel')
const Payment = require('../models/paymentModel')
const {verifyToken, phoneExists, emailExists, generateOTP, sendSMSmock} = require('../utils/helper')


bookings.get('/all', verifyToken(process.env.admin_secret_key), (req, res) => {
    if(req.query){
        if(req.query.closed){
            req.query.closed = JSON.parse(req.query.closed)
        }
        if(req.query.cancellation_requested){
            req.query.cancellation_requested = JSON.parse(req.query.cancellation_requested)
        }
    }
    Booking.find(req.query).exec()
    .then((bookings) => {
        res.status(200).json({bookings})
    })
    .catch(error => res.status(500).json({error}))
})

bookings.get('/all/:booking_id', verifyToken(process.env.admin_secret_key), (req, res) => {
    Booking.findOne({_id: req.params.booking_id}).exec()
    .then(booking => res.status(200).json({booking}))
    .catch(error => res.status(500).json({error}))
})


bookings.get('/open', verifyToken(process.env.patient_secret_key), (req, res) => {
    Booking.findOne({patient_id: req.authData.patient, closed: false}).exec()
    .then(booking => {
        if(!booking){
            res.status(204).json({message: 'No open booking'})
        }
        else{
            res.status(200).json({message: 'Booking exists'})
        }
    })
    .catch(error => res.status(500).json({error}))
})


bookings.get('/status', verifyToken(process.env.patient_secret_key), (req, res) => {
    Booking.findOne({patient_id: req.authData.patient, closed: false}).exec()
    .then(booking => {
        if(!booking){
            res.status(404).json({message: 'Not found'})
        }
        else{
            res.status(200).json({booking})
        }
    })
    .catch(error => res.status(500).json({error}))
})


bookings.post('/assign-consultant/:booking_id', verifyToken(process.env.admin_secret_key), (req, res) => {
    return Promise.all([
        Booking.findOne({_id: req.params.booking_id}).exec(),
        Consultant.findOne({consultant_id: req.body.consultant_id}).exec(),
        Incident.findOne({action_route: `api/bookings/assign-consultant/${req.params.booking_id}`}).exec()
    ])
    .then(([booking, consultant, incident]) => {
        booking.status = 'Consultant Assigned'
        booking.assigned_consultant = consultant._id
        booking.consultant_otp = generateOTP()
        consultant.pending_consultations++
        consultant.patients_to_visit.push(booking.patient_id)
        incident.status = 'intermediate'
        incident.info = 'Consultant visit pending'
        return Promise.all([
            booking.save(),
            consultant.save(),
            incident.save(),
            Patient.findOne({_id: booking.patient_id}).exec()
        ])
        .then(([bs, cs, is, patient]) => {
            const his_her = consultant.consultant_gender === 'male' ? 'his' : 'her'
            sendSMSmock(patient.patient_phone,
                `Your consultant is ${consultant.consultant_name} 
                and ${his_her} contact no is ${consultant.consultant_phone}.
                Your OTP is ${booking.consultant_otp}`
            )
            sendSMSmock(consultant.consultant_phone,
                `Patient name: ${patient.patient_name}, 
                Contact no: ${patient.patient_phone},
                Address: ${patient.patient_address}`
            )
            res.status(200).json({message: 'Consultant assigned and SMS messages sent'})
        })
    })
    .catch(error => res.status(500).json({error}))
})




bookings.post('/assign-sessions/:booking_id', verifyToken(process.env.consultant_secret_key), (req, res) => {
    return Promise.all([
        Booking.findOne({_id: req.params.booking_id}).exec(),
        Consultant.findOne({_id: req.authData.consultant}).exec(),
        Incident.findOne({action_route: `api/bookings/assign-consultant/${req.params.booking_id}`}).exec()
    ])
    .then(([booking, consultant, incident]) => {
        if(req.body.consultant_otp !== booking.consultant_otp){
            res.status(403).json({message: 'Invalid OTP'})
        }
        else{
            booking.allotted_sessions = req.body.allotted_sessions
            booking.number_of_sessions_unlocked = req.body.number_of_sessions_paid_for
            booking.sessions_completed = 0
            booking.status = 'Sessions Assigned'
            booking.session_status = 'not started'
            consultant.number_of_consultations++
            consultant.pending_consultations--
            consultant.patients_to_visit = 
                consultant.patients_to_visit.filter(patient_id => patient_id !== booking.patient_id)
            consultant.last_consultation_date = new Date()
            incident.incident_title = 'Request Ready for Booking' // change the title to something better
            incident.action_route = `api/bookings/assign-physio/${booking._id}`
            incident.status = 'new'
            incident.info = 'Assign physio to patient'
            
            return Promise.all([
                booking.save(),
                consultant.save(),
                new Payment({
                    booking_id: booking._id,
                    customer_id: booking.patient_id,
                    amount: req.body.amount_paid,
                    paid: false
                }).save(),
                incident.save()
            ])
            .then(() => res.status(200).json({message: 'Sessions assigned'}))  
        }
    })
    .catch(error => res.status(500).json({error}))
})


bookings.post('/assign-physio/:booking_id', verifyToken(process.env.admin_secret_key), (req, res) => {
    return Promise.all([
        Booking.findOne({_id: req.params.booking_id}).exec(),
        Physio.findOne({physio_id: req.body.physio_id}).exec(),
        Incident.findOne({action_route: `api/bookings/assign-physio/${req.params.booking_id}`}).exec()
    ]) 
    .then(([booking, physio, incident]) => {
        booking.assigned_physio = physio._id
        physio.current_patients.push(booking.patient_id)
        physio.number_of_patients++
        incident.status = 'processed'
        incident.info = 'Physio has been assigned'
        return Promise.all([
            booking.save(),
            physio.save(),
            incident.save()
        ])
        .then(() => res.status(201).json({message: 'Physio assigned'}))
    })
    .catch(error => res.status(500).json({error}))
})


bookings.post('/unlock-sessions/:booking_id', 
verifyToken(process.env.physio_secret_key, process.env.patient_secret_key), 
(req, res) => {
    Booking.findOne({_id: req.params.booking_id}).exec()    
    .then(booking => {
        booking.number_of_sessions_unlocked += parseInt(req.body.number_of_sessions_paid_for)
        if(booking.number_of_sessions_unlocked > booking.allotted_sessions){
            booking.allotted_sessions += 7
        }
        return Promise.all([
            booking.save(),
            new Payment({
                booking_id: booking._id,
                customer_id: booking.patient_id,
                amount: booking.session_fee * req.body.number_of_sessions_paid_for,
                paid: false
            }).save()
        ])
        .then(() => res.status(201).json({message: 'Sessions Unlocked'}))
    })
    .catch(error => res.status(500).json({error}))
})




bookings.get('/pending-consultations', verifyToken(process.env.consultant_secret_key), (req, res) => {
    Booking.find({assigned_consultant: req.authData.consultant, status: 'Consultant Assigned'}).exec()
    .then(bookings => res.status(200).json({bookings}))
    .catch(error => res.status(500).json({error}))
})

bookings.get('/assigned-bookings', verifyToken(process.env.physio_secret_key), (req,res) => {
    Booking.find({assigned_physio: req.authData.physio, closed: false}).exec()
    .then(bookings => res.status(200).json({bookings}))
    .catch(error => res.status(500).json({error}));
})


bookings.post('/terminate-booking/:booking_id', verifyToken(process.env.admin_secret_key), (req, res) => {
    // also free physios and consultants assigned
    return Promise.all([
        Booking.findOne({_id: req.params.booking_id}).exec(),
        Incident.findOne({action_route: `api/bookings/terminate-booking/${req.params.booking_id}`}).exec()
    ])
    .then(([booking, incident]) => {
        booking.status = 'Terminated'
        booking.closed = true
        // optionally add reason for cancellation if not provided by user
        if(incident){
            incident.status = 'processed'
        }
        return Promise.all([
            booking.save(),
            incident.save()
        ])
        .then(() => res.status(201).json({message: 'Booking terminated'}))
    })
    .catch(error => res.status(500).json({error}))
})




bookings.post('/request-booking-transfer', verifyToken(process.env.physio_secret_key), (req, res) => {
    //
})

bookings.post('/transfer-session', verifyToken(process.env.physio_secret_key), (req, res) => {
    //
})

bookings.post('/transfer-booking/:booking_id', verifyToken(process.env.admin_secret_key), (req, res) => {
    return Promise.all([
        Booking.findOne({_id: req.params.booking_id}).exec(),
        Physio.findOne({_id: req.body.physio_id}).exec()
    ])
    .then(([booking, physio_to_assign]) => {
        return Promise.all([
            Patient.findOne({_id: booking.booked_for_patient}).exec(),
            Physio.findOne({_id: booking.assigned_physio}).exec()
        ])
        .then(([patient, current_physio]) => {
            current_physio.number_of_patients--
            current_physio.current_patients = current_physio.current_patients.filter(pat => pat._id !== patient._id)
            physio_to_assign.number_of_patients++
            physio_to_assign.current_patients.push(patient._id)
            booking.assigned_physio = physio_to_assign._id
            return Promise.all([
                current_physio.save(),
                physio_to_assign.save(),
                booking.save()
            ])
            .then(() => res.status(200).json({message: 'Booking updated'}))
        })
    })
    .catch(error => res.status(500).json({error}))
})



module.exports = bookings