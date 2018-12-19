const express = require('express')
const orders = express.Router()
const Order = require('../models/orderModel')
const Patient = require('../models/patientModel')
const Product = require('../models/productModel')
const Incident = require('../models/incidentModel')
const Dispatch = require('../models/dispatchModel')
const date = require('date-and-time')
const {verifyToken, generateOTP, sendSMSmock} = require('../utils/helper')


orders.get('/', verifyToken(process.env.admin_secret_key), (req, res) => {
    Order.find().exec().then(orders => res.status(200).json({orders})).catch(error => res.status(500).json({error}))
})

orders.get('/open', verifyToken(process.env.patient_secret_key), (req, res) => {
    if(req.authData){
        Order.find({ordered_by: req.authData.patient, closed: false}).exec()
        .then(orders => {
            if(!orders.length){
                res.status(404).json({message: 'No active orders for the user'})
            }
            else{
                res.status(200).json({orders})
            }
        })
        .catch(error => res.status(500).json({error}))
    }
})

// to be accessed by patient
orders.get('/:order_id', verifyToken(process.env.patient_secret_key), (req, res) => {
    Order.findOne({_id: req.params.order_id}).exec()
    .then(order => res.status(200).json({order}))
    .catch(error => res.status(500).json({error}))
})

// to be processed by admin
orders.post('/process/:order_id', verifyToken(process.env.admin_secret_key), (req, res) => {
    const products_to_ship = new Array()
    let amount = 0
    let product = null
    Order.findOne({_id: req.params.order_id}).exec()
    .then(order => {
        return Promise.all([
            Product.find({_id: {'$in':order.ordered_items}}).exec(),
            Patient.findOne({patient_id: order.ordered_by}).exec()
        ])
        .then(([products, requester]) => {
            let items_to_deliver = 'Requester: ' + requester.patient_name + ', Contact: ' + requester.patient_phone 
                                    + ', Address: ' + requester.patient_address + '\n'
            const otp = generateOTP()
            order.delivery_otp = otp
            sendSMSmock(requester.patient_phone, 'Your OTP is ' + otp + '. Please mention this OTP when asked')
            order.processed = true
            order.delivered = false
            order.ordered_items.map(
                item => {
                    if(order.items_rented.includes(item)){
                        products_to_ship.push({product: item, sale_type: 'Rent'})
                        product = products.find(p => p._id == item)
                        if(order.payment_mode === 'cash'){
                            amount += product.rent_price
                        }
                        items_to_deliver += 'Rent: Model ' + product.product_model + ', Name ' + product.product_name + '\n'
                        product.stock_for_rent--
                    }
                    else{
                        products_to_ship.push({product: item, sale_type: 'Purchase'})
                        product = products.find(p => p._id == item)
                        if(order.payment_mode === 'cash'){
                            amount += product.selling_price
                        }
                        items_to_deliver += 'Purchase: Model ' + product.product_model + ', Name ' + product.product_name + '\n'
                        product.stock_for_sale--
                    }
                }
            )
            items_to_deliver += 'Amount to collect: ' + amount
            sendSMSmock('logistics phone number', items_to_deliver)
            return Promise.all([
                products.map(product => product.save()),
                order.save(),
                Incident.findOne({action_route: 'api/orders/process/' + order._id}).exec(),
                new Dispatch({
                    order: order._id,
                    dispatch_type: 'Delivery',
                    products_to_deliver: products_to_ship,
                    amount_to_collect: amount,
                    done: false
                }).save()
            ])
            .then(([products_saved, order_saved, incident, dispatch_saved]) => {
                incident.status = 'intermediate'
                incident.info = 'Awaiting customer confirmation'
                incident.save()
                .then(() => res.status(201).json({message: 'Order processed'}))
            }) 
        })    
    })
    .catch(error => res.status(500).json({error}))
})

orders.get('/ordered-items/:order_id', verifyToken(process.env.admin_secret_key), (req, res) => {
    Order.findOne({_id: req.params.order_id}, 'ordered_items').exec()
    .then(ordered_items => {
        res.status(200).json(ordered_items)
    })
    .catch(error => res.status(500).json({error}))
})

orders.get('/item-name/:id',  (req, res) => {
    Product.findOne({_id: req.params.id}, 'product_name').exec()
    .then(name => res.status(200).json(name))
    .catch(error => res.status(500).json({error}))
})


// this route is to be accessed by the delivery guy
orders.post('/resend-otp/:order_id', verifyToken(process.env.admin_secret_key), (req, res) => {
    Order.findOne({_id: req.params.order_id}).exec()
    .then(order => {
        const otp = generateOTP()
        order.delivery_otp = otp
        sendSMSmock(requester.patient_phone, 'Your OTP is ' + otp + '. Please mention this OTP when asked')
        order.save()
        .then(() => res.status(200).json({message: 'OTP resent'}))
    })
    .catch(error => res.status.json({error}))
})




orders.post('/process-return/:order_id', verifyToken(process.env.admin_secret_key), (req, res) => {  
    Order.findOne({_id: req.params.order_id}).exec()
    .then(order => {
        const today = new Date()
        let patient_details = ''
        let products_to_collect = 'Products to collect: '
        const months = Math.floor(date.subtract(today, order.order_timestamp).toDays() / 30)
        return Promise.all([
            Product.find({_id: {'$in': JSON.parse(req.query.products)}}).exec(),
            Patient.findOne({patient_id: order.ordered_by}).exec()
        ])
        .then(([products, patient]) => {
            patient_details = 'Patient name ' + patient.patient_name + ', Contact: ' + patient.patient_phone
                                + ', Address: ' + patient.patient_address
            products.map(product => products_to_collect +=  product.product_name + ', ')
            new Dispatch({
                order: order._id,
                dispatch_type: 'Return',
                products_to_collect: products.map(product => product._id),
                amount_to_collect: products.reduce((acc, product) => acc + product.rent_price * months, 0),
                done: false
            }).save()
            .then(() => {
                sendSMSmock('logistics phone no', patient_details+products_to_collect)
                res.status(201).json({message: 'Return Request Processed'})
            })
        })
    })
    .catch(error => res.status(500).json({error}))
})


// this route is to be accessed once every few days or daily, depending on business
orders.post('/process-offline-order/:product_id', verifyToken(process.env.admin_secret_key), (req, res) => {
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