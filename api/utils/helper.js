const PhoneAndEmail = require('../models/registeredPhonesAndEmails')
const {twilio_sid, twilio_token, twilio_phone_number} = require('../config/keys')
const smsClient = require('twilio')(twilio_sid, twilio_token)
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
const verifyToken = (key) => {
    return (req, res, next) => {
        const bearerHeader = req.headers['authorization']
        if(bearerHeader !== undefined){
            const bearer = bearerHeader.split(' ')
            const token = bearer[1]
            jwt.verify(token, key, (err, authData) => {
                if(err){
                    res.status(403).json({message: 'Not allowed'})
                }
                else{
                    req.authData = authData
                }
                next()
            })    
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

const sendSMS = (phone_number, message) => {
    smsClient.messages.create({
        to: phone_number,
        from: twilio_phone_number,
        body: message
    })
    .then((message)=>console.log('message sent'))
}

// temporary function for testing
const sendSMSmock = (x , y) => {
    console.log(x+' received message: '+y)
}

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()


module.exports = {upload, verifyToken, phoneExists, emailExists, sendSMS, sendSMSmock, generateOTP}