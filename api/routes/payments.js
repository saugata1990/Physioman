const express = require('express')
const payments = express.Router()
const { patient_secret_key, merchant_key, merchant_salt } = require('../config/keys')
const uniqid = require('uniqid')
const jsSHA = require('jssha')

payments.post('/payumoney-hash', (req, res) => {
    const txnid = req.body.txnid
    const amount = req.body.amount
    const productInfo = req.body.productinfo
    const firstname = req.body.firstname
    const email = req.body.email
    const hashString = merchant_key + '|' + txnid + '|' + amount + '|' + productInfo + '|' + firstname + '|' + email + '|' 
            + '||||||||||' + merchant_salt 
    let sha = new jsSHA('SHA-512', 'TEXT')
    sha.update(hashString)
    const hash = sha.getHash('HEX')
    res.json({hash})
})


payments.post('/payumoney-response', (req, res) => {
    let pd = req.body.response
    pd = JSON.parse(pd)
    const hashString = merchant_salt + '|' + pd.status + '||||||||||' + '|' + pd.email + '|' + pd.firstname + '|' + pd.productinfo + '|'
            + pd.amount + '|' + pd.txnid + '|' + merchant_key
    let sha = new jsSHA('SHA-512', 'TEXT')
    sha.update(hashString)
    const hash = sha.getHash('HEX')
    if(hash == pd.hash) {
        res.status(200).json({message: 'payment successful'})
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




module.exports = payments


