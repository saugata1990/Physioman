const express = require('express')
const physios = express.Router()
const Physio = require('../models/physioModel')
const Consultant = require('../models/consultantModel')
const PhoneAndEmail = require('../models/registeredPhonesAndEmails')
const {phoneExists, emailExists, verifyToken} = require('../utils/helper')
const bcrypt = require('bcrypt')
const date = require('date-and-time')
const jwt = require('jsonwebtoken')


// only admin can view
physios.get('/', verifyToken(process.env.admin_secret_key), (req, res) => {
    Physio.find({terminated: false}).sort('number_of_patients').exec()
    .then((physios) => {
        res.status(200).json({physios: physios})
    })
    .catch(error => res.status(500).json(error))
})


physios.get('/name/:id', verifyToken(process.env.patient_secret_key), (req, res) => {
    Physio.findOne({_id: req.params.id}, 'physio_name').exec()
    .then(physio => res.status(200).json({physio}))
    .catch(error => res.status(500).json({error}))
})


// this route is to be accessed by admin
physios.post('/new-account', verifyToken(process.env.admin_secret_key), (req, res) => {
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
                    number_of_patients: 0,
                    rating: 0,
                    merit_points: 0,
                    sessions_completed: 0,
                    physio_dob: date.parse(req.body.physio_dob.toString(), 'YYYY-MM-DD') || null,
                    date_joined: date.parse(req.body.date_joined.toString(), 'YYYY-MM-DD') || new Date(),
                    isConsultant: req.body.isConsultant || false,
                    terminated: false,
                    debit_amount: 0  
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
                        date_joined: date.parse(req.body.date_joined.toString(), 'YYYY-MM-DD') || new Date(),
                        number_of_consultations: 0,
                        pending_consultations: 0,
                        terminated: false,
                        debit_amount: 0
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


physios.put('/edit/:id', verifyToken(process.env.admin_secret_key), (req, res) => {
    return Promise.all([
        Physio.findOne({physio_id: req.params.id}).exec(),
        Consultant.findOne({consultant_id: req.params.id}).exec()
    ])
    .then(([physio, consultant]) => {
        physio.physio_name = req.body.physio_name
        physio.physio_phone = req.body.physio_phone
        physio.physio_email = req.body.physio_email
        physio.physio_dob = req.body.physio_dob
        physio.date_joined = req.body.date_joined
        physio.isConsultant = req.body.isConsultant
        if(consultant){
            consultant.consultant_name = req.body.physio_name
            consultant.consultant_phone = req.body.physio_phone
            consultant.consultant_email = req.body.consultant_email
        }
        else if(physio.isConsultant){
            consultant = new Consultant({
                consultant_id: physio.physio_id,
                password_hash: physio.password_hash,
                consultant_name: physio.physio_name,
                consultant_phone: physio.physio_phone,
                consultant_email: physio.physio_email,
                consultant_gender: physio.physio_gender,
                date_joined: new Date(),
                number_of_consultations: 0,
                pending_consultations: 0,
                terminated: false,
                debit_amount: physio.debit_amount
            })
        }
        return Promise.all([
            physio.save(),
            consultant.save()
        ])
        .then(() => res.status(201).json({message: 'Physio details updated'}))
    })
    .catch(error => res.status(500).json({error}))
})

physios.delete('/:id', (req, res) => {
    // TODO
})


physios.put('/terminate/:id', (req, res) => {
    return Promise.all([
        Physio.findOne({_id: req.params.id}).exec(),
        Consultant.findOne({_id: req.params.id}).exec()
    ])
    .then(([physio, consultant]) => {
        physio.terminated = true
        if(consultant){
            consultant.terminated = true
            consultant.save(err => console.log('Consultant terminated'))
        }
        physio.save()
        .then(res.status(201).json({message: 'User terminated'}))
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
                    jwt.sign({physio: physio._id}, process.env.physio_secret_key, (err, token) => {
                        res.status(200).json(token)
                    })
                }
                else{
                    res.status(403).json({message: 'Incorrect password'})
                }
            })
        }
    })
    .catch(error => res.status(500).json({error}))
})


physios.get('/details', verifyToken(process.env.admin_secret_key, process.env.physio_secret_key), (req, res) => {
    Physio.findOne({_id: req.authData.physio}).exec()
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

physios.put('/:physio_id/reset-password', verifyToken(process.env.physio_secret_key), (req, res) => {

})

//add routes for update and delete



module.exports = physios