const Consultant = require('../models/consultantModel')
const {phoneExists, emailExists, verifyToken} = require('../utils/helper')
const PhoneAndEmail = require('../models/registeredPhonesAndEmails')
const Request = require('../models/requestModel')
const express = require('express')
const consultants = express.Router()
const bcrypt = require('bcrypt')
const date = require('date-and-time')
const jwt = require('jsonwebtoken')
const { consultant_secret_key, admin_secret_key, physio_secret_key } = require('../config/keys')


consultants.post('/login', (req, res) => {
    Consultant.findOne({consultant_id: req.body.consultant_id}).exec()
    .then((consultant) => {
        if(!consultant){
            res.status(403).json({message: 'consultant does not exist'})
        }
        else{
            bcrypt.compare(req.body.password, consultant.password_hash, (err, isValid) => {
                if(isValid){
                    jwt.sign({consultant: consultant.consultant_id}, consultant_secret_key, (err, token) => {
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


consultants.get('/', verifyToken(admin_secret_key), (req, res) => {
    Consultant.find({terminated: false}).sort('pending_consultations').exec()
    .then((consultants) => {
        res.status(200).json({consultants})
    })
    .catch(error => res.status(500).json({error}))
})

consultants.post('/new-consultant', verifyToken(admin_secret_key), (req, res) => {
    return Promise.all([
        phoneExists(req.body.consultant_phone),
        emailExists(req.body.consultant_email),
        Consultant.findOne({consultant_id: req.body.consultant_id}).exec(),
        bcrypt.hash(req.body.password, 10)
    ])
    .then(([phoneTaken, emailTaken, consultant, hash]) => {
        if(phoneTaken){
            res.status(403).json({message: 'phone number already taken'})
        }
        else if(emailTaken){
            res.status(403).json({message: 'email id already taken'})
        }
        else if(consultant){
            res.status(403).json({message: 'Consultant already exists'})
        }
        else{
            return Promise.all([
                new Consultant({
                    consultant_id: req.body.consultant_id,
                    consultant_name: req.body.consultant_name,
                    consultant_email: req.body.consultant_email,
                    consultant_phone: req.body.consultant_phone,
                    password_hash: hash,
                    isPhysio: false,
                    consultant_gender: req.body.consultant_gender,
                    date_joined: req.body.date_joined ? date.parse(req.body.date_joined.toString(), 'YYYY-MM-DD') 
                                                      : new Date(),
                    number_of_consultations: 0,
                    pending_consultations: 0,
                    terminated: false
                }).save(),
                new PhoneAndEmail({
                    registered_phone_number: req.body.consultant_phone,
                    registered_email: req.body.consultant_email
                }).save()
            ])
            .then(() => res.status(201).json({message: 'Consultant created'}))
        }           
    })
    .catch(error => res.status(500).json({error}))
})


consultants.post('/login', (req, res) => {
    return Promise.all([
        Consultant.findOne({consultant_id: req.body.consultant_id}).exec(),
        bcrypt.compare(req.body.password, consultant.password_hash)  
    ])
    .then(([consultant, isValid]) => {
        if(!consultant){
            res.status(404).json({message: 'consultant does not exist'})
        }
        else{
            if(isValid){
                jwt.sign({consultant: consultant.consultant_id}, consultant_secret_key, (err, token) => {
                    res.status(200).json(token)
                })
            }
            else{
                res.status(404).json({message: 'Invalid password'})
            }
        }
    })
    .catch(error => res.status(500).json(error))
})

consultants.get('/details', verifyToken(consultant_secret_key), (req, res) => {
    Consultant.findOne({consultant_id: req.authData.consultant}).exec()
    .then(consultant => res.status(200).json({consultant}))
    .catch(error => res.status(500).json({error}))
})



 

module.exports = consultants