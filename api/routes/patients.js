const express = require('express')
const patients = express.Router()
const Patient = require('../models/patientModel')
const Physio = require('../models/physioModel')
const Consultant = require('../models/consultantModel')
const Booking = require('../models/bookingModel')
const Request = require('../models/requestModel')
const PhoneAndEmail = require('../models/registeredPhonesAndEmails')
const Verification = require('../models/phoneVerification')
const {verifyToken, generateOTP, sendSMSmock, phoneExists, emailExists} = require('../utils/helper')
const bcrypt = require('bcrypt')
const date = require('date-and-time')
const jwt = require('jsonwebtoken')


patients.get('/',verifyToken(process.env.admin_secret_key), (req, res) => {   
    Patient.find(req.query).exec()
    .then((patients) => {
        res.status(200).json({patients})
    })
    .catch(error => res.status(500).json({error}))
})

patients.get('/name', verifyToken(process.env.admin_secret_key), (req, res) => {   
    Patient.findOne({patient_id: req.query.patient_id}, 'patient_name').exec()
    .then((name) => {
        res.status(200).json(name)
    })
    .catch(error => res.status(500).json({error}))
})

patients.get('/details', (req, res) => {
    Patient.findOne({patient_id: req.query.patient_id}).exec()
    .then((details) => {
        res.status(200).json(details)
    })
    .catch(error => res.status(500).json({error}))
})


patients.post('/signup', (req, res) => {
    return Promise.all([
        phoneExists(req.body.patient_phone),
        emailExists(req.body.patient_email),
        Patient.findOne({patient_phone: req.body.patient_phone}).exec(),
        bcrypt.hash(req.body.password, 10)
    ])
    .then(([phoneTaken, emailTaken, patient, hash]) => {
        if(phoneTaken){
            res.status(400).json({message: 'phone number already taken'})
        }
        else if(emailTaken){
            res.status(400).json({message: 'email already taken'})
        }
        else if(patient){
            res.status(400).json({message: 'patient already exists'})
        }
        else{
            return Promise.all([
                new Patient({
                    patient_id: req.body.patient_phone,
                    patient_phone: req.body.patient_phone,
                    password_hash: hash,
                    patient_name: req.body.patient_name,
                    patient_email: req.body.patient_email || null,
                    email_verified: false,
                    patient_gender: req.body.patient_gender,
                    patient_dob: date.parse(req.body.patient_dob.toString(), 'YYYY-MM-DD') || null,
                    date_joined: new Date(),
                    patient_address: req.body.patient_address,
                    ailment_history: date.format(new Date(), 'DD/MM/YYYY').toString()+':--> '+req.body.ailment_history,
                    total_number_of_sessions: 0,
                    wallet_amount: 0
                }).save(),
                new PhoneAndEmail({
                    registered_phone_number: req.body.patient_phone,
                    registered_email: req.body.patient_email
                }).save()
            ])
            .then(() => res.status(201).json({message: 'Patient created in database'})) 
        }
    })
    .catch(error => res.status(500).json({error}))
})


patients.post('/login', (req, res) => {
    Patient.findOne({patient_id: req.body.patient_id}).exec()
    .then((patient) => {
        if(!patient){
            res.status(403).json({message: 'patient does not exist'})
        }
        else{
            bcrypt.compare(req.body.password, patient.password_hash, (err, isValid) => {
                if(isValid){
                    jwt.sign({patient: patient.patient_id}, patient_secret_key, (err, token) => {
                        res.status(200).json(token)
                    })
                }
                else{
                    res.status(403).json({message: 'Invalid password'})
                }
            })
        }
    })
    .catch(error => res.status(500).json({error}))
})

patients.post('/send-verification-code/:phone_no', (req, res) => {
   Verification.findOne({phone_no: req.params.phone_no}).exec()
   .then(verification => {
       if(verification){
           verification.otp = generateOTP()
           verification.save()
           .then(() => {
                sendSMSmock(verification.phone_no, verification.otp)
                res.status(201).json({message: 'OTP resent'})
           })
       }
       else{
            new Verification({
                phone_no: req.params.phone_no,
                otp: generateOTP()
            }).save()
            .then((verification) => {
                console.log(verification)
                sendSMSmock(verification.phone_no, verification.otp)
                res.status(201).json({message: 'OTP sent'})
            })
       }
   })
   .catch(error => res.status(500).json({error}))
})


patients.post('/verify-otp/:phone_no', (req, res) => {
    Verification.findOneAndDelete({phone_no: req.params.phone_no}).exec()
    .then(verification => {
        if(!verification){
            res.status(403).json({message: 'No OTP has been sent for this number'})
        }
        else{
            if(req.body.otp === verification.otp){
                res.status(201).json({message: 'Phone number verified'})
            }
            else{
                res.status(403).json({message: 'Invalid OTP entered'})
            }
        }
    })
    .catch(error => res.status(500).json({error}))
})


patients.post('/verify-email', verifyToken(process.env.patient_secret_key), (req, res) => {
    //
})


patients.put('/update', (req, res) => {
    //
})

patients.put('/update-password', (req, res) => {
    //
})


patients.post('/reset-password', (req, res) => {
    //
})





patients.get('/viewProfile', verifyToken(process.env.patient_secret_key), (req, res) => {
    if(req.authData){
        Patient.findOne({patient_id: req.authData.patient}).exec()
        .then((patient) => {
            res.status(200).json({patient})
        })
        .catch(error => res.status(500).json(error))
    }
})



patients.get('/viewBookingStatus', verifyToken(process.env.patient_secret_key), (req, res) => {
    if(req.authData){
        return Promise.all([
            Booking.findOne({booked_for_patient: req.authData.patient}).exec(),
            Request.findOne({requested_by_patient: req.authData.patient}).exec()
        ])
        .then(([booking, request]) => {
            if(booking){
                res.status(200).json({booking})
            }
            else if(request){
                res.status(200).json({request})
            }
            else{
                res.status(403).json({message: 'no data found'})
            }
        })
        .catch(error => res.status(500).json(error))
    }
})


patients.get('/:patient_id', verifyToken(process.env.admin_secret_key), (req, res) => {
    Patient.findOne({patient_id: req.params.patient_id}).exec()
    .then((patient) => {
        if(!patient){
            res.status(404).json('Invalid patient id')
        }
        else{
            // info can be seen only by admin
            res.status(200).json({patient})
        }
    })
    .catch(error => res.status(500).json(error))
})



module.exports = patients