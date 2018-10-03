const express = require('express')
const physios = express.Router()
const Physio = require('../models/physioModel')
const Consultant = require('../models/consultantModel')
const PhoneAndEmail = require('../models/registeredPhonesAndEmails')
const {phoneExists, emailExists, verifyToken} = require('../utils/helper')
const { patient_secret_key, admin_secret_key, physio_secret_key, consultant_secret_key } = require('../config/keys')
const bcrypt = require('bcrypt')
const date = require('date-and-time')
const jwt = require('jsonwebtoken')

// only admin can view
physios.get('/', verifyToken(admin_secret_key), (req, res) => {
    Physio.find(req.query).sort('number_of_patients').exec()
    .then((physios) => {
        res.status(200).json({physios: physios})
    })
    .catch(error => res.status(500).json(error))
})

// this route is to be accessed by admin
physios.post('/new-account', verifyToken(admin_secret_key), (req, res) => {
    return Promise.all([
        phoneExists(req.body.physio_phone), 
        emailExists(req.body.physio_email),
        Physio.findOne({physio_id: req.body.physio_id}).exec(),
        bcrypt.hash(req.body.password, 10)
        
    ])
    .then(([phoneTaken, emailTaken, physio, hash]) => {
        if(phoneTaken){
            res.status(403).json({message: 'phone number already taken'})
        }
        else if(emailTaken){
            res.status(403).json({message: 'email id already taken'})
        }
        else if(physio){
            res.status(403).json({message: 'physio id already exists'})
        }
        else{
            return Promise.all([
                new Physio({
                    physio_id: req.body.physio_id,
                    password_hash: hash,
                    physio_name: req.body.physio_name,
                    physio_email: req.body.physio_email,
                    physio_phone: req.body.physio_phone,
                    physio_gender: req.body.physio_gender,
                    rating: 0,
                    sessions_completed: 0,
                    physio_dob: date.parse(req.body.physio_dob.toString(), 'YYYY-MM-DD'),
                    date_joined: date.parse(req.body.date_joined.toString(), 'YYYY-MM-DD'),
                    isConsultant: req.body.isConsultant || false   
                }).save(),
                new PhoneAndEmail({
                    registered_phone_number: req.body.physio_phone,
                    registered_email: req.body.physio_email
                }).save()
            ])
            .then(() => {
                if(req.body.isConsultant === true){
                    new Consultant({
                        consultant_id: req.body.physio_id, 
                        consultant_name: req.body.physio_name,
                        consultant_email: req.body.physio_email,
                        consultant_phone: req.body.physio_phone,
                        password_hash: hash,
                        isPhysio: true,
                        consultant_gender: req.body.physio_gender,
                        date_joined: date.parse(req.body.date_joined.toString(), 'YYYY-MM-DD'),
                        number_of_consultations: 0,
                        pending_consultations: 0
                    }).save(err => {
                        res.status(200).json({message: 'Physio created and added as consultant'})
                    })
                }
                else{
                    res.status(200).json({message: 'Physio created'})
                }
            })
            .catch(error => res.status(500).json({error}))            
        }
    })
    .catch(error => res.status(500).json({error}))
})


physios.post('/login', (req, res) => {
    Physio.findOne({physio_id: req.body.physio_id}).exec()
    .then((physio) => {
        if(!physio){
            res.status(403).json({message: 'physio does not exist'})
        }
        else{
            bcrypt.compare(req.body.password, physio.password_hash, (err, isValid) => {
                if(isValid){
                    jwt.sign({physio: physio.physio_id}, physio_secret_key, (err, token) => {
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


// only logged in user can view
physios.get('/details', verifyToken(physio_secret_key), (req, res) => {
    Physio.findOne({physio_id: req.authData.physio}).exec()
    .then((physio) => {
        if(!physio){
            res.status(404).json({message: 'Invalid physio id'})
        }
        else{
            res.status(200).json({physio})
        }
    })
    .catch(error => res.status(500).json(error))
})

physios.put('/:physio_id/reset-password', verifyToken(physio_secret_key), (req, res) => {

})

//add routes for update and delete



module.exports = physios