const express = require('express')
const payments = express.Router()
const jsSHA = require('jssha')
const Transaction = require('../models/transactionModel')
const Patient = require('../models/patientModel')
const Physio = require('../models/physioModel')
const Consultant = require('../models/consultantModel')
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


payments.post('/confirm-cash-received/:patient_id', 
                verifyToken(process.env.physio_secret_key, process.env.consultant_secret_key), (req, res) => {
    let collector = null
    let id = null
    return Promise.all([
        Patient.findOne({_id: req.params.patient_id}).exec(),
        Physio.findOne({physio_id: req.authData.physio }).exec(),
        Consultant.findOne({consultant_id: req.authData.consultant }).exec()
    ])
    .then(([patient, physio, consultant]) => {
        patient.wallet_amount += parseInt(req.body.amount)
        if(physio){
            physio.debit_amount += parseInt(req.body.amount)
            collector = `${physio.physio_name}(${physio.physio_id})`
            id = physio._id
        }
        else if(consultant){
            consultant.debit_amount += parseInt(req.body.amount)
            collector = `${consultant.consultant_name}(${consultant.consultant_id})`
            id = consultant._id
        }
        savePhysio = physio? physio.save() : Promise.resolve()
        saveConsultant = consultant? consultant.save() : Promise.resolve()
        return Promise.all([
            patient.save(),
            new Incident({
                action_route: `api/payments/collect-cash/${id}`,
                customer: patient.patient_id,
                priority: 1,
                status: 'new',
                timestamp: new Date(),
                incident_title: 'Cash Collection',
                info: 'Collect Rs. '+ req.body.amount + ' from ' + collector 
            }).save(),
            new Transaction({
                transaction_type: 'cash',
                transaction_amount: req.body.amount,
                payee: patient.patient_name,
                recipient: 'Physioman',
                timestamp: new Date()
            }).save(),
            savePhysio,
            saveConsultant
        ])
        .then(() => res.status(201).json({message: 'Transaction successful'}))
    })
    .catch(error => res.status(500).json({error}))
})

payments.post('/wallet-recharge-success', verifyToken(process.env.patient_secret_key), (req, res) => {
    Patient.findOne({patient_id: req.authData.patient}).exec()
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



module.exports = payments


