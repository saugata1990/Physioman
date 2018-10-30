const express = require('express')
const orders = express.Router()
const Order = require('../models/orderModel')
const Patient = require('../models/patientModel')
const Product = require('../models/productModel')
const Incident = require('../models/incidentModel')
const date = require('date-and-time')
const {verifyToken, generateOTP, sendSMSmock} = require('../utils/helper')
const { patient_secret_key, admin_secret_key } = require('../config/keys')


orders.get('/', (req, res) => {
    Order.find().exec().then(orders => res.status(200).json({orders})).catch(error => res.status(500).json({error}))
})

orders.get('/open', verifyToken(patient_secret_key), (req, res) => {
    if(req.authData){
        Order.findOne({ordered_by: req.authData.patient, closed: false}).exec()
        .then(order => {
            if(!order){
                res.status(404).json({message: 'No active orders for the user'})
            }
            else{
                res.status(200).json({order})
            }
        })
        .catch(error => res.status(500).json({error}))
    }
})

// to be accessed by user/patient
orders.get('/:order_id', verifyToken(patient_secret_key), (req, res) => {
    Order.findOne({_id: req.params.order_id}).exec()
    .then(order => res.status(200).json({order}))
    .catch(error => res.status(500).json({error}))
})

// to be processed by admin
orders.post('/process/:order_id', verifyToken(admin_secret_key), (req, res) => {
    Order.findOne({_id: req.params.order_id}).exec()
    .then(order => {
        return Promise.all([
            Product.find({_id: {'$in':order.ordered_items}}).exec(),
            Patient.findOne({patient_id: order.ordered_by}).exec()
        ])
        .then(([products, requester]) => {
            // const otp = generateOTP()
            // order.delivery_otp = otp
            // sendSMSmock(requester.patient_phone, 'Your OTP is ' + otp + '. Please mention this OTP when asked')
            order.processed = true
            order.delivered = false
            products.map(
                product => {
                    if(product.product_model in order.items_rented){
                        product.stock_for_rent--
                    }
                    else{
                        product.stock_for_sale--
                    }
                }
            )
            return Promise.all([
                products.map(product => product.save()),
                order.save(),
                Incident.findOne({action_route: 'api/orders/process/' + order._id}).exec()
            ])
            .then(([products_saved, order_saved, incident]) => {
                console.log(incident)
                incident.status = 'intermediate'
                incident.info = 'Awaiting customer confirmation'
                incident.save()
                .then(() => res.status(201).json({message: 'Order processed'}))
            }) 
        })    
    })
    .catch(error => res.status(500).json({error}))
})


// orders.post('/resend-otp/:order_id', verifyToken(admin_secret_key), (req, res) => {
//     Order.findOne({_id: req.params.order_id}).exec()
//     .then(order => {
//         const otp = generateOTP()
//         order.delivery_otp = otp
//         sendSMSmock(requester.patient_phone, 'Your OTP is ' + otp + '. Please mention this OTP when asked')
//         order.save()
//         .then(() => res.status(200).json({message: 'OTP resent'}))
//     })
//     .catch(error => res.status.json({error}))
// })


// otp to be mentioned by the customer to the delivery guy or to admin via phone
orders.post('/delivery/:order_id', verifyToken(admin_secret_key), (req, res) => {
    Order.findOne({_id: req.params.order_id}).exec()
    .then(order => {
        order.delivered = true
        if(!order.items_rented.length){
            order.closed = true
        }
        order.save()
        .then(() => {
            if(order.delivery_otp === req.body.otp){
                res.status(201).json({message: 'Order delivery confirmed'})
            }
            else{
                res.status(403).json({message: 'OTP mismatch'})
            }
        })
    })
    .catch(error => res.status.json({error}))
})




// to be written later
orders.post('/process-return/:order_id', (req, res) => {
    Order.findOne({_id: req.params.order_id}).exec()
})

// this route is to be accessed once every few days or daily, depending on business
orders.post('/process-offline-order/:product_id', verifyToken(admin_secret_key), (req, res) => {
    Product.findOne({_id: req.params.product_id}).exec()
    .then(product => {
        product.stock_for_sale -= req.body.units_sold || 0
        product.stock_for_rent -= (req.body.units_rented || 0) - (req.body.rented_units_returned || 0)
        product.save()
        .then(() => res.status(201).json({message: 'Inventory updated'}))
    })
    .catch(error => res.status(500).json({error}))
})




module.exports = orders