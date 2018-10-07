// lots of functions will be shifted to other routes from here

const express = require('express')
const admin = express.Router()
const Request = require('../models/requestModel')
const Booking = require('../models/bookingModel')
const Consultant = require('../models/consultantModel')
const Patient = require('../models/patientModel')
const Physio = require('../models/physioModel')
const PhoneAndEmail = require('../models/registeredPhonesAndEmails')
const Incident = require('../models/incidentModel')
const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const Admin = require('../models/adminModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {sendSMS, sendSMSmock, generateOTP, verifyToken, phoneExists, emailExists} = require('../utils/helper')
const { admin_secret_key } = require('../config/keys')


// create routes for user creation and login

admin.get('/', (req, res) => {
    Admin.find()
    .then((admins) => res.status(200).json({admins}))
    .catch(error => res.status(500).json({error}))
})

// route to be accessed by admin
admin.post('/new-admin', (req, res) => {
    return Promise.all([
        phoneExists(req.body.admin_phone), 
        emailExists(req.body.admin_email),
        Admin.findOne({admin_id: req.body.admin_id}).exec(),
        bcrypt.hash(req.body.password, 10)   
    ])
    .then(([phoneTaken, emailTaken, admin, hash]) => {
        if(phoneTaken){
            res.status(400).json({message: 'phone number already taken'})
        }
        else if(emailTaken){
            res.status(400).json({message: 'email id already taken'})
        }
        else if(admin){
            res.status(400).json({message: 'admin id already exists'})
        }
        else{
            return Promise.all([
                new Admin({
                    admin_id: req.body.admin_id,
                    password_hash: hash,
                    admin_email: req.body.admin_email,
                    admin_phone: req.body.admin_phone
                }).save(),
                new PhoneAndEmail({
                    registered_phone_number: req.body.admin_phone,
                    registered_email: req.body.admin_email
                }).save()
            ])
            .then(() => res.status(201).json({message: 'Admin id created in database'}))
        }
    })
    .catch(error => res.status(500).json({error}))
})


admin.post('/login', (req, res) => {   
    Admin.findOne({admin_id: req.body.admin_id}).exec()
    .then((admin) => {
        if(!admin){
            res.status(404).json({message: 'admin does not exist'})
        }
        else{
            bcrypt.compare(req.body.password, admin.password_hash, (err, isValid) => {
                if(isValid){
                    jwt.sign({admin: admin.admin_id}, admin_secret_key, (err, token) => {
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


admin.post('/booking-payment-due/:patient_id', verifyToken(admin_secret_key), (req, res) => {
    return Promise.all([
        Patient.findOne({patient_id: req.params.patient_id}).exec(),
        Incident.findOne({action_route: '/booking-payment-due/' + req.params.patient_id}).exec()
    ])
    .then(([patient, incident]) => {
        if(req.body.payment_received){
            sendSMSmock(patient.patient_phone, 'We have received your payment by cash.')
            incident.status = 'processed'
        }
        else{
            sendSMSmock(patient.patient_phone, 'We are yet to receive payment for your booking.')
        }
        incident.save()
        .then(() => res.status(200).json({message: 'SMS sent'}))
    })
    .catch(error => res.status(500).json({error}))
})

// this route is to be removed in production
admin.get('/delete-all', (req, res) => {
    // Physio.collection.drop()
    // Consultant.collection.drop()
    Incident.collection.drop()
    // Patient.collection.drop()
    Request.collection.drop()  
    Booking.collection.drop()
    // PhoneAndEmail.collection.drop()
    Order.collection.drop()
    Product.collection.drop()
    Session.collection.drop()
    res.status(200).json({message: 'Collections deleted'})
})





module.exports = admin