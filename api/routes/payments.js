const express = require('express')
const payments = express.Router()
const jsSHA = require('jssha')
const Transaction = require('../models/transactionModel')
const Patient = require('../models/patientModel')
const Physio = require('../models/physioModel')
const Consultant = require('../models/consultantModel')
const Booking = require('../models/bookingModel')
const Incident = require('../models/incidentModel')
const {verifyToken} = require('../utils/helper')


payments.post('/payumoney-hash', (req, res) => {
    const txnid = req.body.txnid
    const amount = req.body.amount
    const productInfo = req.body.productinfo
    const firstname = req.body.firstname
    const email = req.body.email
    const hashString = process.env.merchant_key + '|' + txnid + '|' + amount + '|' + productInfo + '|' + firstname + '|' + email + '|' 
            + '||||||||||' + process.env.merchant_salt 
    let sha = new jsSHA('SHA-512', 'TEXT')
    sha.update(hashString)
    const hash = sha.getHash('HEX')
    res.status(200).json({hash})
})


payments.post('/payumoney-response', (req, res) => {
    let pd = req.body.response
    pd = JSON.parse(pd)
    const hashString = process.env.merchant_salt + '|' + pd.status + '||||||||||' + '|' + pd.email + '|' + pd.firstname + '|' + pd.productinfo + '|'
            + pd.amount + '|' + pd.txnid + '|' + process.env.merchant_key
    let sha = new jsSHA('SHA-512', 'TEXT')
    sha.update(hashString)
    const hash = sha.getHash('HEX')
    if(hash == pd.hash) {
        new Transaction({
            transaction_type: 'card',
            transaction_amount: pd.amount,
            payee: pd.firstname,
            recipient: 'Physioman',
            timestamp: new Date()
        }).save()
        .then(() => res.status(200).json({message: 'payment successful'}))
    }
    else{
        res.status(400).json({message: 'error occurred'})
    }
})

payments.get('/success', (req, res) => {
    console.log('success route hit')
    res.status(201).json({message: 'success'})
})

payments.get('/failure', (req, res) => {
    console.log('failure route hit')
    res.status(400).json({message: 'failure'})
})

// change parameter patient_id from patient_id to _id
payments.post('/confirm-cash-received/:patient_id', 
verifyToken(process.env.physio_secret_key, process.env.consultant_secret_key), (req, res) => {
    let collector = null
    let id = null
    let saveIncident = Promise.resolve()
    let saveTransaction = Promise.resolve()
    let saveBooking = Promise.resolve()
    return Promise.all([
        Patient.findOne({_id: req.params.patient_id}).exec(),
        Physio.findOne({_id: req.authData.physio }).exec(),
        Consultant.findOne({_id: req.authData.consultant }).exec(),
        Incident.findOne({action_route: `api/admin/booking-payment-due/${req.params.patient_id}`}).exec(),
        Booking.findOne({booked_for_patient: req.params_patient_id}).exec()
    ])
    .then(([patient, physio, consultant, incident, booking]) => {
        patient.wallet_amount += parseInt(req.body.amount_received - req.body.amount_payable)
        if(incident && patient.wallet_amount >= booking.amount_payable){
            patient.wallet_amount -= parseInt(booking.amount_payable)
            booking.amount_payable = 0
            booking.closed = booking.sessions_completed === booking.allotted_sessions ? true : false
            incident.status = 'processed'
            saveIncident = incident.save()
            saveTransaction = new Transaction({
                transaction_type: 'cash',
                transaction_amount: booking.amount_payable,
                payee: patient.patient_name,
                recipient: 'Physioman',
                timestamp: new Date()
            }).save()
            saveBooking = booking.save()
        }
        if(physio){
            physio.debit_amount += parseInt(req.body.amount_received)
            collector = `${physio.physio_name}(${physio.physio_id})`
            id = physio._id
        }
        else if(consultant){
            consultant.debit_amount += parseInt(req.body.amount_received)
            collector = `${consultant.consultant_name}(${consultant.consultant_id})`
            id = consultant._id
        }
        let savePhysio = physio? physio.save() : Promise.resolve()
        let saveConsultant = consultant? consultant.save() : Promise.resolve()
        return Promise.all([
            patient.save(),
            new Incident({
                action_route: `api/services/payments/collect-cash/${id}`,
                customer: patient.patient_id,
                priority: 1,
                status: 'new',
                timestamp: new Date(),
                incident_title: 'Cash Collection',
                info: `Collect Rs. ${req.body.amount_received} from ${collector}` 
            }).save(),
            new Transaction({
                transaction_type: 'cash',
                transaction_amount: req.body.amount_received,
                payee: patient.patient_name,
                recipient: 'Physioman',
                timestamp: new Date()
            }).save(),
            saveTransaction,
            savePhysio,
            saveConsultant,
            saveIncident,
            saveBooking
        ])
        .then(() => res.status(201).json({message: 'Transaction successful'}))
    })
    .catch(error => res.status(500).json({error}))
})


payments.get('/payable-amount/:patient_id', verifyToken(process.env.consultant_secret_key, process.env.physio_secret_key),
(req, res) => {
    let amount = 0
    Booking.find({booked_for_patient: req.params.patient_id}).exec()
    .then(bookings => {
        bookings.map(booking => amount += booking.amount_payable)
        res.status(200).json({amount})
    })
    .catch(error => res.status(500).json({error}))
})


payments.get('/amount-to-collect/:id', verifyToken(process.env.admin_secret_key), (req, res) => {
    let amount = 0
    return Promise.all([
        Physio.findOne({_id: req.params.id}).exec(),
        Consultant.findOne({_id: req.params.id}).exec()
    ])
    .then(([physio, consultant]) => {
        if(physio){
            amount = physio.debit_amount
        }
        else if(consultant){
            amount = consultant.debit_amount
        }
        res.status(200).json({amount})
    })
    .catch(error => res.status(500).json({error}))
})

payments.post('/collect-cash/:id', verifyToken(process.env.admin_secret_key), (req, res) => {
    return Promise.all([
        Physio.findOne({_id: req.params.id}).exec(),
        Consultant.findOne({_id: req.params.id}).exec(),
        Incident.find({action_route: `api/services/payments/collect-cash/${req.params.id}`}).exec()
    ])
    .then(([physio, consultant, incidents]) => {
        let savePhysio = Promise.resolve(), saveConsultant = Promise.resolve()
        if(physio){
            physio.debit_amount = 0
            savePhysio = physio.save()
        }
        else if(consultant){
            consultant.debit_amount = 0
            saveConsultant = consultant.save()
        }
        return Promise.all([
            savePhysio,
            saveConsultant,
            incidents.map(incident => {
                incident.status = 'processed'
                return incident.save()
            })
        ])
        .then(() => res.status(201).json({message: 'Cash collected'}))
    })
    .catch(error => res.status(500).json({error}))
})

payments.post('/wallet-recharge-success', verifyToken(process.env.patient_secret_key), (req, res) => {
    Patient.findOne({_id: req.authData.patient}).exec()
    .then(patient => {
        patient.wallet_amount += parseInt(req.body.amount)
        return Promise.all([
            patient.save(),
            new Transaction({
                transaction_type: 'card',
                transaction_amount: req.body.amount,
                payee: patient.patient_name,
                recipient: patient.patient_name,
                timestamp: new Date()
            }).save()
        ])
        .then(() => res.status(201).json({message: 'Wallet recharge successful'}))
    })
    .catch(error => res.status(500).json({error}))
})


payments.get('/check-wallet-balance', verifyToken(process.env.patient_secret_key), (req, res) => {
    Patient.findOne({_id: req.authData.patient}).exec()
    .then(patient => {
        if(patient.wallet_amount >= req.query.amount){
            res.status(200).json({message: 'Balance is sufficient'})
        }
        else{
            res.status(400).json({message: 'Insufficient balance'})
        }
    })
    .catch(error => res.status(500).json({error}))
})


payments.post('/pay-with-wallet', verifyToken(process.env.patient_secret_key), (req, res) => {
    let savePatient = Promise.resolve(), saveBooking = Promise.resolve(), saveIncident = Promise.resolve()
    let success = true
    return Promise.all([
        Patient.findOne({_id: req.authData.patient}).exec(),
        Incident.findOne({action_route: `api/admin/booking-payment-due/${req.authData.patient}`}).exec(),
        Booking.findOne({booked_for_patient: req.authData.patient}).exec()
    ])
    .then(([patient, incident, booking]) => {
        if(incident && patient.wallet_amount >= booking.amount_payable){
            patient.wallet_amount -= parseInt(booking.amount_payable)
            savePatient = patient.save()
            booking.amount_payable = 0
            booking.closed = booking.sessions_completed === booking.allotted_sessions ? true : false
            saveBooking = booking.save()
            incident.status = 'processed'
            saveIncident = incident.save()
        }
        if(req.body.amount){
            if(patient.wallet_amount >= req.body.amount){
                patient.wallet_amount -= parseInt(req.body.amount)
                savePatient = patient.save()
            }
            else{
                success = false
            }
        }
        
        return Promise.all([
            savePatient,
            saveBooking,
            saveIncident
        ])
        .then(() => {
            if(success){
                res.status(201).json({message: 'Payment successful'})
            }
            else{
                res.status(400).json({message: 'Payment failed due to insufficient balance'})
            }
        })
    })
    .catch(error => res.status(500).json({error}))
})



module.exports = payments


