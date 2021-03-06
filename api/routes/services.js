const express = require('express')
const services = express.Router()
const crypto = require('crypto')
const {verifyToken, sendMail, sendSMS, geocode, reverse_geocode} = require('../utils/helper')
const Patient = require('../models/patientModel')
const Booking = require('../models/bookingModel')
const Order = require('../models/orderModel')
const Incident = require('../models/incidentModel')
const Payment = require('../models/paymentModel')
const payments = require('./payments')
const jwt = require('jsonwebtoken')
const date = require('date-and-time')


services.use('/payments', payments)

services.post('/new-booking-request', verifyToken(process.env.patient_secret_key), (req, res) => {
    console.log(req.body)
    return Promise.all([
        Booking.findOne({patient_phone: req.authData.patient, closed: false}).exec(),
        Patient.findOne({_id: req.authData.patient}).exec()
    ])
    .then(([booking_exists, patient]) => {
        if(booking_exists){
            res.status(403).json({message: 'Booking already exists'})
        }
        else{
            let isPaid = req.body.consultation_payment_mode === 'cash' ? false : true
            patient.ailment_history.push({date: new Date(), description: req.body.ailment_description})
            const booking = new Booking({
                patient_id: req.authData.patient,
                ailment_description: req.body.ailment_description,
                physio_gender_preference: req.body.physio_gender_preference,
                consultation_fee: 100,  // hardcoding to be removed
                session_fee: 300,
                consultation_fee_paid: isPaid,
                payment_by_cash: !isPaid,
                request_timestamp: new Date(),
                status: 'Request Placed',
                closed: false
            })
            patient.bookings.push(booking._id)
            return Promise.all([
                patient.save(),
                booking.save()
            ])
            .then(() => {
                new Incident({
                    action_route: `api/bookings/assign-consultant/${booking._id}`,
                    customer: booking.patient_phone,
                    priority: 2,
                    status: 'new',
                    timestamp: booking.request_timestamp,
                    incident_title: 'Booking Request',
                    info: 'New Booking Request'
                }).save()
                .then(() => res.status(201).json({booking}))
            })
        }
    })
    .catch(error => res.status(500).json({error}))
})


services.post('/cancel-booking/:booking_id', verifyToken(process.env.patient_secret_key), (req, res) => {
    Booking.findOne({_id: req.params.booking_id}).exec()
    .then(booking => {
        booking.cancellation_requested = true
        booking.reason_for_cancellation = req.body.reason_for_cancellation
        return Promise.all([
            booking.save(),
            new Incident({
                action_route: `api/bookings/terminate-booking/${req.params.booking_id}`,
                customer: req.authData.patient, 
                priority: 2,
                status: 'new',
                timestamp: new Date(),
                incident_title: 'Booking Cancellation',
                info: `Reason for cancellation: ${req.body.reason_for_cancellation || 'Not mentioned'}`
            }).save()
        ])
        .then(() => res.status(201).json({message: 'Booking cancellation request placed'}))
    })
    .catch(error => res.status(500).json({error}))
})





services.post('/place-order', verifyToken(process.env.patient_secret_key), (req, res) => {
    if(req.authData){
        const amount_payable = req.body.items_purchased.reduce((acc, item) => acc + item.selling_price, 0)
                                + req.body.items_rented.reduce((acc, item) => acc + item.rent_price, 0)
        const order = new Order({
            ordered_by: req.authData.patient,
            items_purchased: req.body.items_purchased,
            items_rented: req.body.items_rented,
            ordered_items: req.body.items_purchased.concat(req.body.items_rented),
            payable_amount: amount_payable,
            payment_mode: req.body.payment_mode,
            processed: false,
            order_timestamp: new Date(),
            closed: false
        })
        return Promise.all([
            order.save(),
            Patient.findOne({_id: req.authData.patient}).exec()
        ])
        .then(([orderSaved, patient]) => {
            patient.orders.push(order._id)
            return Promise.all([
                patient.save(),
                new Incident({
                    action_route: `api/orders/process/${order._id}`,
                    customer: order.ordered_by,
                    priority: 2,
                    status: 'new',
                    timestamp: order.order_timestamp,
                    incident_title: 'Equipment Order',
                    info: 'New Equipment Order'
                }).save()
            ])
            .then(() => res.status(201).json({order}))
        })  
        .catch(error => res.status(500).json({error}))
    }
})


services.post('/order-cancel-request/:order_id', verifyToken(process.env.patient_secret_key), (req, res) => {
    Order.findOne({_id: req.params.order_id}).exec()
    .then(order => {
        order.cancellation_requested = true
        order.reason_for_cancellation = req.body.reason_for_cancellation
        return Promise.all([
            order.save(),
            new Incident({
                action_route: `api/orders/cancel-order/${order._id}`,
                customer: order.ordered_by,
                priority: 2,
                status: 'new',
                timestamp: new Date(),
                incident_title: 'Order Cancellation',
                info: `Customer wrote: ${req.body.reason_for_cancellation}`
            }).save()
        ])
        .then(() => res.status(201).json({message: 'Order cancellation request placed'}))
    })
    .catch(error => res.status(500).json({error}))
})


services.post('/initiate-return/:order_id', verifyToken(process.env.patient_secret_key), (req, res) => {  
    Order.findOne({_id: req.params.order_id}).exec()
    .then(order => {
        new Incident({
            action_route: `api/orders/process-return/${order._id}?products=${req.body.products}`, 
            customer: order.ordered_by,
            priority: 1,
            status: 'new',
            timestamp: new Date(),
            incident_title: 'Rented Equipment Return'
        }).save()
        .then(() => res.status(201).json({message: 'Return request placed'}))
    })
    .catch(error => res.status(500).json({error}))
})


services.post('/sell-back/:order_id', verifyToken(process.env.patient_secret_key), (req, res) => {
    Order.findOne({_id: req.params.order_id}).exec()
    .then(order => {
        new Incident({
            action_route: `api/orders/process-sellback/${order._id}?products=${req.body.products}`, 
            customer: order.ordered_by,
            priority: 1,
            status: 'new',
            timestamp: new Date(),
            incident_title: 'Sell Back Request'
        }).save()
        .then(() => res.status(201).json({message: 'Sell Back request placed'}))
    })
    .catch(error => res.status(500).json({error}))
})



// test geocoding
services.get('/test-geocoding', (req, res) => {
    
    geocode('28/3, Onkarmal Jetia Road, Howrah-711103')
    .then(data => {
        console.log(data)
        res.status(200).json({data})
    })
    .catch(error => {
        console.log(error)
        res.status(500).json({error})
    })
})

services.get('/test-reverse-geocoding', (req, res) => {
    
    reverse_geocode(22.55800, 88.30433)
    .then(data => {
        console.log(data[0].formattedAddress)
        res.status(200).json({data})
    })
    .catch(error => {
        console.log(error)
        res.status(500).json({error})
    })
})






module.exports = services