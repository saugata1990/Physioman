const express = require('express')
const payments = express.Router()
const jsSHA = require('jssha')
const Transaction = require('../models/transactionModel')
const Patient = require('../models/patientModel')
const Physio = require('../models/physioModel')
const Consultant = require('../models/consultantModel')
const Booking = require('../models/bookingModel')
const Order = require('../models/orderModel')
const Incident = require('../models/incidentModel')
const Payment = require('../models/paymentModel')
const {verifyToken} = require('../utils/helper')


payments.get('/payumoney-auth', verifyToken(process.env.patient_secret_key), (req, res) => {
    res.status(200).json({auth: process.env.auth_header})
})


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


// this route is accessed by physio/consultant for acknowledging cash payment
payments.post('/booking-cash-payment/:booking_id', 
verifyToken(process.env.physio_secret_key, process.env.consultant_secret_key),
(req, res) => {
    // let consultation_fee = false
    let savePhysio = Promise.resolve(), saveConsultant = Promise.resolve()
    let amount_payable = 0
    let id = null, collector = null
    return Promise.all([
        Payment.findOne({booking_id: req.params.booking_id, paid: false}).exec(),
        Booking.findOne({_id: req.params.booking_id}).exec(),
        Physio.findOne({_id: req.authData.physio}).exec(),
        Consultant.findOne({_id: req.authData.consultant}).exec(),
        Patient.findOne({bookings: req.params.booking_id}).exec() 
    ])
    .then(([payment, booking, physio, consultant, patient]) => {
        payment.paid = true
        amount_payable = parseFloat(payment.amount)
        if(!booking.consultation_fee_paid){
            booking.consultation_fee_paid = true
        }   
        
        if(physio){
            physio.debit_amount += amount_payable
            id = physio._id
            collector = `${physio.physio_name}(${physio.physio_id})`
            savePhysio = physio.save()
        }
        else if(consultant){
            consultant.debit_amount += amount_payable
            id = consultant._id
            collector = `${consultant.consultant_name}(${consultant.consultant_id})`
            saveConsultant = consultant.save()
        }    
        
        return Promise.all([
            payment.save(),
            savePhysio,
            saveConsultant,
            booking.save(),
            new Incident({
                action_route: `api/services/payments/collect-cash/${id}`,
                customer: booking.patient_id,
                priority: 2,
                status: 'new',
                timestamp: new Date(),
                incident_title: 'Collect Cash from personnel',
                info: `Collect Rs. ${amount_payable} from ${collector}`
            }).save(),
            new Transaction({
                transaction_type: 'cash',
                transaction_amount: amount_payable,
                payee: patient.patient_name,
                recipient: 'Physioman',
                info: `Paid to ${collector}`,
                timestamp: new Date()
            }).save() 
        ])
        .then(() => {
            res.status(201).json({message: 'Payment accepted'})
        })
        
    })
    .catch(error => res.status(500).json({error}))
})


// this route is accessed when patient pays with cash for wallet recharge
payments.post('/cash-receipt/:patient_id', verifyToken(process.env.physio_secret_key, process.env.consultant_secret_key),
(req, res) => {
    let collector = null, id = null
    return Promise.all([
        Patient.findOne({_id: req.params.patient_id}).exec(),
        Physio.findOne({_id: req.authData.physio}).exec(),
        Consultant.findOne({_id: req.authData.consultant}).exec()
    ])
    .then(([patient, physio, consultant]) => {
        patient.wallet_amount += parseFloat(req.body.amount)
        if(physio){
            physio.debit_amount += parseFloat(req.body.amount)
            collector = `${physio.physio_name}(${physio.physio_id})`
            id = physio._id
        }
        else if(consultant){
            consultant.debit_amount += parseFloat(req.body.amount)
            collector = `${consultant.consultant_name}(${consultant.consultant_id})`
            id = consultant._id
        }
        let savePhysio = physio? physio.save() : Promise.resolve()
        let saveConsultant = consultant? consultant.save() : Promise.resolve()
        return Promise.all([
            patient.save(),
            savePhysio,
            saveConsultant,
            new Transaction({
                transaction_type: 'cash',
                transaction_amount: req.body.amount,
                payee: patient.patient_name,
                recipient: 'Physioman',
                info: `Paid to ${collector}`,
                timestamp: new Date()
            }).save(),
            new Incident({
                action_route: `api/services/payments/collect-cash/${id}`,
                customer: patient.patient_id,
                priority: 1,
                status: 'new',
                timestamp: new Date(),
                incident_title: 'Cash Collection',
                info: `Collect Rs. ${req.body.amount} from ${collector}` 
            }).save()

        ])
        .then(() => res.status(201).json({message: 'Transaction successful'}))
    })
    .catch(error => res.status(500).json({error}))
})


payments.get('/payable-amount/:patient_id', verifyToken(process.env.consultant_secret_key, process.env.physio_secret_key),
(req, res) => {
    let amount = 0
    Booking.find({patient_id: req.params.patient_id}).exec()
    .then(bookings => {
        bookings.map(booking => amount += booking.amount_payable)
        res.status(200).json({amount})
    })
    .catch(error => res.status(500).json({error}))
})


// rethink
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

// All incidents involving the physio/consultant are handled at once
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
        patient.wallet_amount += parseFloat(req.body.amount)
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


payments.post('/wallet-payment', verifyToken(process.env.patient_secret_key), (req, res) => {
    Patient.findOne({_id: req.authData.patient}).exec()
    .then(patient => {
        patient.wallet_amount -= parseFloat(req.body.amount)
        patient.save()
        .then(() => res.status(201).json({message: 'Wallet Payment Successful'}))
    })
    .catch(error => res.status(500).json({error}))
})


module.exports = payments


