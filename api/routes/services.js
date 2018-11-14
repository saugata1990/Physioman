const express = require('express')
const services = express.Router()
const crypto = require('crypto')
const {verifyToken, sendSMS} = require('../utils/helper')
const Patient = require('../models/patientModel')
const Booking = require('../models/bookingModel')
const Request = require('../models/requestModel')
const Order = require('../models/orderModel')
const Incident = require('../models/incidentModel')
const payments = require('./payments')
const jwt = require('jsonwebtoken')
const date = require('date-and-time')
const { patient_secret_key, admin_secret_key } = require('../config/keys')


services.use('/payments', payments)

// to be accessed by patient
services.post('/new-booking-request', verifyToken(patient_secret_key), (req, res) => {
    return Promise.all([
        Request.findOne({requested_by_patient: req.authData.patient, closed: false}).exec(),
        Patient.findOne({patient_id: req.authData.patient}).exec()
    ])
    .then(([request, patient]) => {
        if(request){
            res.status(400).json({message: 'Request already logged'})
        }
        else{
            patient.ailment_history += '\n'+date.format(new Date(), 'DD/MM/YYYY')+':-->'+req.body.ailment_description
            const booking_request = new Request({
                requested_by_patient: req.authData.patient,
                ailment_description: req.body.ailment_description,
                physio_gender_preference: req.body.physio_gender_preference,
                consultation_payment_mode: req.body.consultation_payment_mode,
                request_timestamp: new Date(),
                ready_for_booking: false,
                processed_by_consultant: false,
                closed: false
            })
            patient.bookings.push(booking_request._id)
            return Promise.all([
                patient.save(),
                booking_request.save()
            ])
            .then(() => {
                new Incident({
                    action_route: 'api/bookings/assign-consultant/' + booking_request._id,
                    customer: booking_request.requested_by_patient,
                    priority: 2,
                    status: 'new',
                    timestamp: booking_request.request_timestamp,
                    incident_title: 'Booking Request',
                    info: 'New Booking Request'
                }).save()
                .then(() => res.status(200).json({message: 'New Request logged'}))
            })
        }
    })
    .catch(error => res.status(500).json(error)) 
})



services.post('/cancel-booking-request', verifyToken(patient_secret_key),(req, res) => {
    //
})

services.post('/cancel-booking', verifyToken(patient_secret_key), (req, res) => {
    //
})

services.post('/place-order', verifyToken(patient_secret_key), (req, res) => {
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
            Patient.findOne({patient_id: req.authData.patient}).exec()
        ])
        .then(([orderSaved, patient]) => {
            patient.orders.push(order._id)
            return Promise.all([
                patient.save(),
                new Incident({
                    action_route: 'api/orders/process/' + order._id,
                    customer: order.ordered_by,
                    priority: 2,
                    status: 'new',
                    timestamp: order.order_timestamp,
                    incident_title: 'Equipment Order',
                    info: 'New Equipment Order'
                }).save()
            ])
            .then(() => res.status(201).json({message: 'Order placed'}))
        })  
        .catch(error => res.status(500).json({error}))
    }
})


services.post('/order-cancel-request/:order_id', verifyToken(patient_secret_key), (req, res) => {
    Order.findOne({_id: req.params.order_id}).exec()
    .then(order => {
        order.cancellation_requested = true
        order.reason_for_cancellation = req.body.reason_for_cancellation
        return Promise.all([
            order.save(),
            new Incident({
                action_route: 'api/orders/cancel-order/' + order._id,
                customer: order.ordered_by,
                priority: 2,
                status: 'new',
                timestamp: new Date(),
                incident_title: 'Order Cancellation',
                info: 'Customer wrote: ' + req.body.reason_for_cancellation
            }).save()
        ])
        .then(() => res.status(201).json({message: 'Order cancellation request placed'}))
    })
    .catch(error => res.status(500).json({error}))
})


services.post('/initiate-return/:order_id', verifyToken(patient_secret_key), (req, res) => {
    Order.findOne({_id: req.params.order_id}).exec()
    .then(order => {
        new Incident({
            action_route: 'api/orders/process-return/' + order._id + '?products=' + req.query.products, 
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




module.exports = services