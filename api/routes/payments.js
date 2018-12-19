const express = require('express')
const payments = express.Router()
const jsSHA = require('jssha')
const Transaction = require('../models/transactionModel')
const Physio = require('../models/physioModel')
const Consultant = require('../models/consultantModel')
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
    // TBD
})



module.exports = payments


