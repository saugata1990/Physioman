const express = require('express')
const bookings = express.Router()
const Booking = require('../models/bookingModel')
const Request = require('../models/requestModel')
const Physio = require('../models/physioModel')
const Patient = require('../models/patientModel')
const Consultant = require('../models/consultantModel')
const Incident = require('../models/incidentModel')
const {verifyToken, phoneExists, emailExists, generateOTP, sendSMSmock} = require('../utils/helper')


bookings.get('/', verifyToken(process.env.admin_secret_key), (req, res) => {
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


bookings.get('/open', verifyToken(process.env.patient_secret_key), (req, res) => {
    if(req.authData){
        return Promise.all([
            Booking.findOne({booked_for_patient: req.authData.patient, closed: false}).exec(),
            Request.findOne({requested_by_patient: req.authData.patient, closed: false}).exec()
        ])
        .then(([booking, request]) => {
            if(booking || request){
                res.status(200).json({status: true})
            }
            else{
                res.status(200).json({status: false})
            }
        })
        .catch(error => res.status(500).json({error}))
    }
})


bookings.get('/status', verifyToken(process.env.patient_secret_key), (req, res) => {
    if(req.authData){
        return Promise.all([
            Booking.findOne({booked_for_patient: req.authData.patient, closed: false}).exec(),
            Request.findOne({requested_by_patient: req.authData.patient, closed: false}).exec()
        ])
        .then(([booking, request]) => {
            if(booking){
                res.status(200).json({booking, status: 'Confirmed'})
            }
            else if(request){
                if(request.mapped_consultant){
                    res.status(200).json({request, status: 'Processed'})
                }
                else{
                    res.status(200).json({request, status: 'Pending'})
                }
            }
            else{
                res.status(404).json({message: 'Not Found'})
            }
        })
        .catch(error => res.status(500).json({error}))
    }
})



bookings.get('/requests', verifyToken(process.env.admin_secret_key), (req, res) => {   
    Request.find(req.query).exec()
    .then((requests) => {
        res.status(200).json({requests})
    })
    .catch(error => res.status(500).json({error}))
})

bookings.get('/requests/:request_id', verifyToken(process.env.admin_secret_key), (req, res) => {  
    Request.findOne({_id: req.params.request_id}).exec()
    .then((request) => {
        res.status(200).json({request})
    })
    .catch(error => res.status(500).json({error}))
})


bookings.post('/new/:request_id', verifyToken(process.env.admin_secret_key), (req, res) => {
    return Promise.all([
        Request.findOne({_id: req.params.request_id, ready_for_booking: true, closed: false}).exec(),
        Physio.findOne({physio_id: req.body.physio_id}).exec(),
        Incident.findOne({action_route: 'api/bookings/new/' + req.params.request_id, status: 'new'}).exec()
    ])
    .then(([request, physio, incident]) => {
        if(!request){
            res.status(403).json({message: 'invalid request'})
        }
        else{
            request.closed = true
            physio.current_patients.push(request.requested_by_patient)
            physio.number_of_patients++
            if(request.booking_amount_payable > request.booking_amount_received){
                incident.action_route = 'api/admin/booking-payment-due/' + request.requested_by_patient
                incident.status = 'intermediate'
                incident.timestamp = Date.now()
                incident.incident_title = 'Booking Payment Pending'
            }
            else{
                incident.status = 'processed'
            }
            return Promise.all([
                new Booking({
                    booked_for_patient: request.requested_by_patient,
                    assigned_physio: req.body.physio_id,
                    allotted_sessions: request.sessions_fixed_by_consultant,
                    sessions_completed: 0,
                    session_status: 'not started',
                    booked_at: new Date(),
                    amount_payable: request.booking_amount_payable - request.booking_amount_received, 
                    closed: false
                }).save(),
                request.save(),
                physio.save(),
                incident.save()
            ])
            .then(() => res.status(200).json({message: 'Booking created'}))        
        }
    })
    .catch(error => res.status(500).json(error))
})

bookings.put('/extend', verifyToken(process.env.physio_secret_key), (req, res) => {
    //
})


bookings.post('/assign-consultant/:request_id', verifyToken(process.env.admin_secret_key), (req, res) => {   
    return Promise.all([
        Request.findOne({_id: req.params.request_id}).exec(),
        Consultant.findOne({consultant_id: req.body.consultant_id}).exec(),
        Incident.findOne({action_route: 'api/bookings/assign-consultant/' + req.params.request_id}).exec()
    ])
    .then(([request, consultant, incident]) => {
        request.serviced_at = new Date()
        request.serviced_by = req.authData.admin
        consultant.pending_consultations++
        consultant.patients_to_visit.push(request.requested_by_patient)
        request.mapped_consultant = consultant.consultant_id 
        request.consultant_otp = generateOTP()
        request.ready_for_booking = false
        incident.status = 'intermediate'
        incident.info = 'Awaiting consultation'
        return Promise.all([
            Patient.findOne({patient_id: request.requested_by_patient}).exec(),
            request.save(),
            consultant.save(),
            incident.save()  
        ])
        .then(([patient, request_saved, consultant_saved, incident_saved]) => {
            let his_her = 'his'
            if(consultant.consultant_gender == 'female'){
                his_her = 'her'
            }
            sendSMSmock(patient.patient_phone,
                `Your consultant is ${consultant.consultant_name} 
                and ${his_her} contact no is ${consultant.consultant_phone}.
                Your OTP is ${request.consultant_otp}`
            )
            sendSMSmock(consultant.consultant_phone,
                `Patient name: ${patient.patient_name}, 
                Contact no: ${patient.patient_phone},
                Address: ${patient.patient_address}`
            )
            res.status(200).json({message: 'Consultant assigned and sms messages sent'})

        })
    })
    .catch(error => res.status(500).json({error}))
})


// route to be accessed by consultant (otp needed) 
bookings.put('/assign-sessions/:request_id', verifyToken(process.env.consultant_secret_key), (req, res) => {  
    return Promise.all([
        Request.findOne({_id: req.params.request_id, 
                        consultant_otp: req.body.consultant_otp}).exec(),
        Consultant.findOne({consultant_id: req.authData.consultant}).exec()
    ])
    .then(([request, consultant]) => {
        if(!request){
            res.status(403).json({message: 'Invalid OTP'})
        }
        else{
            Incident.findOne({customer: request.requested_by_patient}).exec() 
            .then(incident => {
                request.sessions_fixed_by_consultant = req.body.sessions_fixed
                request.processed_by_consultant = true
                request.ready_for_booking = true
                request.booking_amount_payable = req.body.booking_amount_payable
                request.booking_amount_received = req.body.booking_amount_received
                consultant.number_of_consultations++
                consultant.pending_consultations--
                consultant.patients_to_visit = 
                    consultant.patients_to_visit.filter(patient_id => patient_id !== request.requested_by_patient)
                consultant.last_consultation_date = new Date()
                incident.action_route = 'api/bookings/new/' + request._id
                incident.status = 'new'
                incident.timestamp = consultant.last_consultation_date
                incident.incident_title = 'Request Ready for Booking'
                incident.priority = 1,
                incident.info = 'Ready for booking'
                return Promise.all([
                    request.save(),
                    consultant.save(),
                    incident.save()
                ])
                .then(() => res.status(200).json({message: 'Ready for booking'}))
            })
        }
    })
    .catch(error => res.status(500).json({error}))
})


bookings.get('/pending-consultations', verifyToken(process.env.consultant_secret_key), (req, res) => {
    Request.find({mapped_consultant: req.authData.consultant, processed_by_consultant: false}).exec()
    .then(requests => res.status(200).json({requests}))
    .catch(error => res.status(500).json({error}))
})

bookings.get('/assigned-bookings', verifyToken(process.env.physio_secret_key), (req,res) => {
    Booking.find({assigned_physio: req.authData.physio, closed: false}).exec()
    .then(bookings => res.status(200).json({bookings}))
    .catch(error => res.status(500).json({error}));
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