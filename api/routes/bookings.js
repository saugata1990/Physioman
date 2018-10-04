const express = require('express')
const bookings = express.Router()
const Booking = require('../models/bookingModel')
const Request = require('../models/requestModel')
const Physio = require('../models/physioModel')
const Patient = require('../models/patientModel')
const Consultant = require('../models/consultantModel')
const Incident = require('../models/incidentModel')
const {verifyToken, phoneExists, emailExists, generateOTP, sendSMSmock} = require('../utils/helper')
const { patient_secret_key, admin_secret_key, consultant_secret_key, physio_secret_key } = require('../config/keys')


bookings.get('/', verifyToken(admin_secret_key), (req, res) => {
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


bookings.get('/open', verifyToken(patient_secret_key), (req, res) => {
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


bookings.get('/status', verifyToken(patient_secret_key), (req, res) => {
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



bookings.get('/requests', verifyToken(admin_secret_key), (req, res) => {   
    // if(req.query){
    //     req.query.ready_for_booking = JSON.parse(req.query.ready_for_booking)
    // }
    Request.find(req.query).exec()
    .then((requests) => {
        res.status(200).json({requests})
    })
    .catch(error => res.status(500).json({error}))
})

bookings.get('/requests/:request_id', verifyToken(admin_secret_key), (req, res) => {  
    Request.findOne({_id: req.params.request_id}).exec()
    .then((request) => {
        res.status(200).json({request})
    })
    .catch(error => res.status(500).json({error}))
})


// it is assumed that the browser will load request details
bookings.post('/new/:request_id', verifyToken(admin_secret_key), (req, res) => {
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
            incident.status = 'processed'
            return Promise.all([
                new Booking({
                    booked_for_patient: request.requested_by_patient,
                    assigned_physio: req.body.physio_id,
                    allotted_sessions: request.sessions_fixed_by_consultant,
                    sessions_completed: 0,
                    booked_at: new Date(),
                    payment_mode: request.booking_payment_mode, 
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

bookings.put('/extend', verifyToken(admin_secret_key), (req, res) => {
    //
})


bookings.post('/assign-consultant/:request_id', verifyToken(admin_secret_key), (req, res) => {   
    return Promise.all([
        Request.findOne({_id: req.params.request_id}).exec(),
        Consultant.findOne({consultant_id: req.body.consultant_id}).exec(),
        Incident.findOne({action_route: 'api/bookings/assign-consultant/' + req.params.request_id}).exec()
    ])
    .then(([request, consultant, incident]) => {
        console.log(request)
        console.log(consultant)
        console.log(incident)
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
bookings.put('/assign-sessions/:request_id', verifyToken(consultant_secret_key), (req, res) => {  
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
                request.booking_payment_mode = req.body.booking_payment_mode
                request.processed_by_consultant = true;
                if(request.booking_payment_mode === 'cash'){
                    request.booking_payment_received = req.body.booking_payment_received
                }
                if(request.booking_payment_mode === 'cash' && request.booking_payment_received 
                || request.booking_payment_mode === 'card'){
                    request.ready_for_booking = true
                }
                consultant.number_of_consultations++
                consultant.pending_consultations--
                consultant.patients_to_visit = 
                    consultant.patients_to_visit.filter(patient_id => patient_id !== request.requested_by_patient)
                consultant.last_consultation_date = new Date()
                return Promise.all([
                    request.save(),
                    consultant.save()
                ])
                .then(() => {
                    if(!request.ready_for_booking){
                        res.status(200).json({message: 'Booking payment pending'})
                    }
                    else{
                        incident.action_route = 'api/bookings/new/' + request._id
                        incident.status = 'new'
                        incident.timestamp = consultant.last_consultation_date
                        incident.incident_title = 'Request Ready for Booking'
                        incident.priority = 1,
                        incident.info = 'Ready for booking'
                        incident.save()
                        .then(() => res.status(200).json({message: 'Ready for booking'}))
                    }   
                })
            })
        }
    })
    .catch(error => res.status(500).json({error}))
})


bookings.get('/pending-consultations', verifyToken(consultant_secret_key), (req, res) => {
    Request.find({mapped_consultant: req.authData.consultant, processed_by_consultant: false}).exec()
    .then(requests => res.status(200).json({requests}))
    .catch(error => res.status(500).json({error}))
})

bookings.get('/assigned-bookings', verifyToken(physio_secret_key), (req,res) => {
    Booking.find({assigned_physio: req.authData.physio, closed: false}).exec()
    .then(bookings => res.status(200).json({bookings}))
    .catch(error => res.status(500).json({error}));
})




module.exports = bookings