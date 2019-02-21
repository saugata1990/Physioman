const PhoneAndEmail = require('../models/registeredPhonesAndEmails')
const smsClient = require('twilio')(process.env.twilio_sid, process.env.twilio_token)
const nodemailer = require('nodemailer')
const NodeGeocoder = require('node-geocoder')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')


const storage = multer.diskStorage({
    destination: './images/',
    filename: (req, file, cb)=> {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));  
    }
})

const upload = multer({
    storage: storage
})


// JWT middleware
const verifyToken = (...keys) => {
    return (req, res, next) => {
        let authorized = false
        const bearerHeader = req.headers['authorization']
        if(bearerHeader !== undefined){
            const bearer = bearerHeader.split(' ')
            const token = bearer[1]
            keys.map(key => {
                jwt.verify(token, key, (err, authData) => {
                    // if(err){
                    //     console.log('user not authorized')
                    // }
                    if(authData){
                        req.authData = authData
                        authorized = true
                        next()
                    }
                })
            })
            if(!authorized){
                res.status(403).json({message: 'Not allowed'})
            }
        }
        else{
            res.status(403).json({message: 'Not allowed'})
        }
    }
}


const phoneExists = (phone_number) => {
    return new Promise((resolve, reject) => {
        PhoneAndEmail.findOne({registered_phone_number: phone_number}).exec()
        .then((found) => {
            if(found){
                resolve(true)
            }
            else{
                resolve(false)
            }
        })
    })
}

const emailExists = (email) => {
    return new Promise((resolve, reject) => {
        PhoneAndEmail.findOne({registered_email: email}).exec()
        .then((found) => {
            if(found && email.length>0){
                resolve(true)
            }
            else{
                resolve(false)
            }
        })
    })
}

const sendMail = (recipient, subject, content) => {
    const transporter = nodemailer.createTransport({
        // values to be fetched from env
        service: 'gmail',
        auth: {
            user: 'saugata1990@gmail.com',
            pass: '12Bgarden@h3'
        }
    })
    const mailOptions = {
        from: 'saugata1990@gmail.com',
        to: recipient,
        subject: subject,
        html: content
    }
    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log(err)
        }
        else{
            console.log('Email sent')
        }
    })
}

const sendSMS = (phone_number, message) => {
    smsClient.messages.create({
        to: phone_number,
        from: process.env.twilio_phone_number,
        body: message
    })
    .then((message)=>console.log('message sent'))
}

// temporary function for testing
const sendSMSmock = (x , y) => {
    console.log(x+' received message: '+y)
}

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()


const geocode = (address) => {
    const options = {
        provider: 'google',
        apiKey: process.env.geocoder_api_key,
        formatter: null
    }
    const geocoder = NodeGeocoder(options)
    return geocoder.geocode(address)        
} 

const geocode_mock = (address) => {
    return new Promise((resolve, reject) => {
        resolve(JSON.parse('[{"formattedAddress":"12/16, Botanical Garden Rd, Botanical Garden Area, Howrah, West Bengal 711103, India","latitude":22.5578794,"longitude":88.3041605,"extra":{"googlePlaceId":"ChIJW1o_Acp5AjoR6pYZkklwMhk","confidence":1,"premise":null,"subpremise":null,"neighborhood":"Botanical Garden Area","establishment":null},"administrativeLevels":{"level2long":"Howrah","level2short":"Howrah","level1long":"West Bengal","level1short":"WB"},"streetNumber":"12/16","streetName":"Botanical Garden Road","city":"Howrah","country":"India","countryCode":"IN","zipcode":"711103","provider":"google"}]'))
    })
}

const reverse_geocode = (lat, lon) => {
    const options = {
        provider: 'google',
        apiKey: process.env.geocoder_api_key,
        formatter: null
    }
    const geocoder = NodeGeocoder(options)
    return geocoder.reverse({lat, lon})
}

const reverse_geocode_mock = (lat, lon) => {
    return new Promise((resolve, reject) => {
        resolve(JSON.parse('[{"formattedAddress":"12/3, B Shalimar Area, Shalimar, Howrah, West Bengal 711103, India","latitude":22.558005,"longitude":88.304345,"extra":{"googlePlaceId":"ChIJb-w0-LV5AjoR1ut2w3Id134","confidence":1,"premise":"12/3","subpremise":null,"neighborhood":"B Shalimar Area","establishment":null},"administrativeLevels":{"level2long":"Howrah","level2short":"Howrah","level1long":"West Bengal","level1short":"WB"},"city":"Howrah","country":"India","countryCode":"IN","zipcode":"711103","provider":"google"}]'))
    })
}


module.exports = {upload, verifyToken, phoneExists, geocode, geocode_mock, reverse_geocode, reverse_geocode_mock,
     emailExists, sendMail, sendSMS, sendSMSmock, generateOTP}