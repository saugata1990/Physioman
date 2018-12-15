const express = require('express')
const logistics = express.Router()
const Dispatch = require('../models/dispatchModel')
const Order = require('../models/orderModel')
const Incident = require('../models/incidentModel')
const DeliveryMan = require('../models/deliveryManModel')
const bcrypt = require('bcrypt')
const { verifyToken } = require('../utils/helper')


logistics.post('/create-id', (req, res) => {
    return Promise.all([
        DeliveryMan.findOne({user_id: req.body.user_id}).exec(),
        bcrypt.hash(req.body.password, 10)
    ])
    .then(([deliveryMan, hash]) => {
        if(deliveryMan){
            res.status(403).json({message: 'User already exists'})
        }
        else{
            new DeliveryMan({
                user_id: req.body.user_id,
                password_hash: hash,
                name: req.body.name
            }).save()
            .then(() => res.status(201).json({message: 'New User Created'}))
        }
    })
    .catch(error => res.status(500).json({error}))
})


logistics.post('/login', (req, res) => {
    DeliveryMan.findOne({user_id: req.body.user_id}).exec()
    .then(deliveryMan => {
        if(!deliveryMan){
            res.status(404).json({message: 'Invalid user id'})
        }
        else{
            bcrypt.compare(req.body.password, deliveryMan.password_hash, (err, isValid) => {
                if(isValid){
                    jwt.sign({deliveryMan: user_id}, deliveryMan_secret_key, (err, token) => {
                        res.status(200).json(token)
                    })
                }
                else{
                    res.status(403).json({message: 'Incorrect password'})
                }
            })
        }
    })
    .catch(error => res.status(500).json({error}))
})


logistics.get('/deliveries', (req, res) => {
    Dispatch.find().exec()
    .then(dispatches => res.status(200).json({dispatches}))
    .catch(error => res.status(500).json({error}))
})


logistics.post('/delivery/:dispatch_id', (req, res) => {
    let otp_mismatch = false
    Dispatch.findOne({_id: req.params.dispatch_id}).exec()
    .then(dispatch => {
        dispatch.done = true
        Order.findOne({_id: dispatch.order}).exec()
        .then(order => {
            if(dispatch.dispatch_type === 'Delivery'){
                if(order.delivery_otp !== req.body.otp){
                    otp_mismatch = true
                    res.status(403).json({message: 'Invalid OTP'})
                }
                else{
                    order.delivered = true
                    if(!order.items_rented.length){
                        order.closed = true
                    }
                }
            }
            if(!otp_mismatch){
                return Promise.all([
                    order.save(),
                    dispatch.save(),
                    Incident.findOne({action_route: 'api/orders/process/' + order._id}).exec()
                ])
                .then(([order_saved, dispatch_saved, incident]) => {
                    incident.status = 'processed'
                    incident.save()
                    .then(() => res.status(201).json({message: 'Operation successful'}))
                })
            }
        })
    })
    .catch(error => res.status(500).json({error}))
})



module.exports = logistics