const express = require('express')
const patients = express.Router()
const Patient = require('../models/patientModel')
const Incident = require('../models/incidentModel')
const Physio = require('../models/physioModel')
const Consultant = require('../models/consultantModel')
const Booking = require('../models/bookingModel')
const PhoneAndEmail = require('../models/registeredPhonesAndEmails')
const Verification = require('../models/phoneVerification')
const {verifyToken, generateOTP, sendMail, sendSMSmock, phoneExists, emailExists} = require('../utils/helper')
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


// route for posting a query without login
patients.post('/query', (req, res) => {
    let message = 
    `<h3>
        <strong>Name</strong>: ${req.body.name} <br/>
        <strong>Phone No</strong>: ${req.body.phone} <br/>
        <strong>Query</strong>: ${req.body.query || 'Not provided by user'} 
    </h3>`
    sendMail('saugata1990@gmail.com', 'New Query', message)
    res.status(200).json({message: 'Query posted'})
})


// might remove this route
patients.get('/name-and-contact', verifyToken(process.env.admin_secret_key), (req, res) => {   
    Patient.findOne({_id: req.query.patient_id}, ['patient_name', 'patient_phone']).exec()
    .then((name) => {
        res.status(200).json(name)
    })
    .catch(error => res.status(500).json({error}))
})

patients.get('/info', verifyToken(process.env.physio_secret_key, process.env.consultant_secret_key), (req, res) => {
    Patient.findOne({_id: req.query.patient_id}).exec()
    .then((patient) => {
        res.status(200).json({patient})
    })
    .catch(error => res.status(500).json({error}))
})


// signup to contain basic info like name, phone no and password
// another route 'complete-profile' to enter other details

patients.post('/signup', (req, res) => {
    return Promise.all([
        phoneExists(req.body.patient_phone),
        Patient.findOne({patient_phone: req.body.patient_phone}).exec(),
        bcrypt.hash(req.body.password, 10)
    ])
    .then(([phoneTaken, patient, hash]) => {
        if(phoneTaken){
            res.status(400).json({message: 'phone number already taken'})
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
                    patient_gender: req.body.patient_gender,
                    date_joined: new Date(),
                    total_number_of_sessions: 0,
                    wallet_amount: 0
                }).save(),
                new PhoneAndEmail({
                    registered_phone_number: req.body.patient_phone,
                }).save()
            ])
            .then(() => res.status(201).json({message: 'Patient created in database'})) 
        }
    })
    .catch(error => res.status(500).json({error}))
})


patients.post('/edit-profile', verifyToken(process.env.patient_secret_key), (req, res) => {
    Patient.findOne({_id: req.authData.patient}).exec()
    .then(patient => {
        if(req.body.patient_email){
            patient.patient_email = req.body.patient_email
            patient.email_verified = false
        }
        patient.patient_dob = req.body.patient_dob ? date.parse(req.body.patient_dob.toString(), 'YYYY-MM-DD') 
                                                   : patient.patient_dob 
        patient.patient_address = req.body.patient_address
        if(req.body.ailment_description){
            patient.ailment_history.push({date: new Date(), description: req.body.ailment_description})
        }
        patient.save()
        .then(() => res.status(201).json({message: 'Profile edited'}))
    })
    .catch(error => res.status(500).json({error}))
})

patients.post('/change-address', verifyToken(process.env.patient_secret_key), (req, res) => {
    Patient.findOne({_id: req.authData.patient}).exec()
    .then(patient => {
        patient.patient_address = req.body.patient_address
        patient.save()
        .then(() => res.status(201).json({message: 'Patient address updated'}))
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
                    jwt.sign({patient: patient._id}, process.env.patient_secret_key, (err, token) => {
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


patients.post('/email-verification', verifyToken(process.env.patient_secret_key), (req, res) => {
    Patient.findOne({_id: req.authData.patient}).exec()
    .then(patient => {
        if(patient.email_verified){
            res.status(400).json({message: 'Email already verified'})
        }
        else {
            jwt.sign({email: patient.patient_email}, process.env.patient_secret_key, (err, token) => {
                const url = `${process.env.baseUrl}/api/patients/confirm-email/${token}`
                sendMail(patient.patient_email, 'Verify your email', 
                `<h5>Click <a href=${url}>here</a> to confirm your email</h5>`) 
                res.status(200).json({message: 'Email sent'})
            })
        }
    })
    .catch(error => res.status(500).json({error})) 
})

patients.get('/confirm-email/:token', (req, res) => {
    jwt.verify(req.params.token, process.env.patient_secret_key, (err, authData) => {
        if(err){
            res.status(403).json({message: 'Error occured'})
        }
        else {
            Patient.findOne({patient_email: authData.email}).exec()
            .then(patient => {
                patient.email_verified = true
                PhoneAndEmail.findOne({registered_phone_number: patient.patient_phone}).exec()
                .then(entry => {
                    entry.registered_email = patient.patient_email
                    return Promise.all([
                        entry.save(),
                        patient.save()
                    ])
                    .then(() => res.status(201).send(`<h1>Your email has been verified. 
                        You can close this window.</h1>`))
                })
            })
            .catch(error => res.status(500).json({error}))
        }
    })
})


patients.put('/change-phone', (req, res) => {
    //
})

patients.post('/update-password', verifyToken(process.env.patient_secret_key), (req, res) => {
    Patient.findOne({_id: req.authData.patient}).exec()
    .then(patient => {
        bcrypt.compare(req.body.current_password, patient.password_hash, (err, isValid) => {
            if(err){
                res.status(403).json({message: 'Current password is wrong'})
            }
            else{
                bcrypt.hash(req.body.new_password, 10)
                .then(hash => {
                    patient.password_hash = hash
                    patient.save()
                    .then(() => res.status(201).json({message: 'Password updated'}))
                })
            }
        })
    })
    .catch(error => res.status(500).json({error}))
})


patients.post('/reset-password', (req, res) => {
    Patient.findOne({patient_id: req.body.patient_id, patient_name: req.body.patient_name}).exec()
    .then(patient => {
        const password = Math.random().toString(36).substr(2, 12)
        const mailText = `Your password has been reset to ${password}`
        if(patient.patient_email){
            sendMail(patient.patient_email, 'Password reset', mailText)
        }
        sendSMSmock(patient.patient_phone, mailText)
        bcrypt.hash(password, 10)
        .then(hash => {
            patient.password_hash = hash
            patient.save()
            .then(() => res.status(201).json({message: 'Password reset'}))
        })
        
    })
    .catch(error => res.status(500).json({error}))
})





patients.get('/viewProfile', verifyToken(process.env.patient_secret_key), (req, res) => {
    if(req.authData){
        Patient.findOne({_id: req.authData.patient}).exec()
        .then((patient) => {
            res.status(200).json({patient})
        })
        .catch(error => res.status(500).json({error}))
    }
})


patients.get('/booking-and-orders', verifyToken(process.env.patient_secret_key), (req, res) => {
    let hasBooking = false, hasOrdered = false
    Patient.findOne({_id: req.authData.patient}).exec()
    .then(patient => {
        if(patient.orders.length > 0){
            hasOrdered = true
        }
        Booking.findOne({patient_id: req.authData.patient, closed: false}).exec()
        .then(booking => {
           hasBooking = booking ? true : false
           res.status(200).json({hasBooking, hasOrdered})
        })
    })
    .catch(error => res.status(500).json({error}))
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