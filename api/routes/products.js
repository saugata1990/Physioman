const express = require('express')
const products = express.Router()
const Product = require('../models/productModel')
const Review = require('../models/reviewModel')
const { upload, verifyToken } = require('../utils/helper')
const jwt = require('jsonwebtoken')
const fs = require('fs')


products.get('/search', (req, res) => {
    Product.search(req.query.q)
    .then(products => res.status(200).json({products, count: products.length}))
    .catch(error => res.status(500).json({error}))
})


// to be used by admin
products.get('/:product_model', verifyToken(process.env.admin_secret_key), (req, res) => {
    Product.findOne({product_model: req.params.product_model}).exec()
    .then(product => res.status(200).json({product}))
})


// verifyToken(process.env.admin_secret_key, process.env.patient_secret_key)
// use a different route for users not logged in
products.get('/',  (req, res) => { 
    Product.find(req.query).exec()
    .then(products => {
        res.status(200).json({products, count: products.length})
    })
    .catch(error => res.status(500).json({error}))
})


products.get('/details/:id', verifyToken(process.env.admin_secret_key, process.env.patient_secret_key), (req, res) => {   
    Product.findOne({_id: req.params.id}).exec()
    .then(product => res.status(200).json({product}))
    .catch(error => res.status(500).json({error}))
})



products.post('/add-new', verifyToken(process.env.admin_secret_key), upload.single('image'), (req, res) => {  
    let filePath = null
    if(req.file !== undefined){
        filePath = req.file.path
    }
    Product.findOne({product_model: req.body.product_model}).exec()
    .then(product => {
        if(product){
            res.status(400).json({message: 'Product model already exists'})
        }
        else{
            new Product({
                product_model: req.body.product_model,
                product_name: req.body.product_name,
                product_manufacturer: req.body.product_manufacturer,
                product_category: req.body.product_category,
                product_specifications: req.body.product_specifications || '',
                product_description: req.body.product_description || '',
                product_image: {data: fs.readFileSync(filePath).toString('base64'), contentType: 'image/jpg'},
                selling_price: req.body.selling_price,
                rent_price: req.body.rent_price,
                stock_for_sale: req.body.stock_for_sale || 0,
                stock_for_rent: req.body.stock_for_rent || 0
            }).save()
            .then(() => res.status(201).json({message: 'Equipment added'}))
        }
    })
    .catch(error => res.status(500).json({error}))
})



products.put('/update/:id', verifyToken(process.env.admin_secret_key), upload.single('image'), (req, res) => {
    let filePath = null
    if(req.file !== undefined){
        filePath = req.file.path
    }
    Product.findOne({_id: req.params.id}).exec()
    .then(product => {
        if(!product){
            res.status(404).json({message: 'Product does not exist'})
        }
        else{
            product.product_model = req.body.product_model
            product.product_name = req.body.product_name
            product.product_manufacturer =  req.body.product_manufacturer
            product.product_category = req.body.product_category
            product.product_specifications = req.body.product_specifications
            product.product_description = req.body.product_description
            if(filePath){
                product.product_image = {data: fs.readFileSync(filePath).toString('base64'), contentType: 'image/jpg'}
            }             
            product.printed_price = req.body.printed_price
            product.save()
            .then(() => res.status(201).json({message: 'Equipment updated'}))
        }
    })
    .catch(error => res.status(500).json({error}))
})

products.delete('/remove/:id', verifyToken(process.env.admin_secret_key), (req, res) => {
    Product.findOneAndDelete({_id: req.params.id}).exec()
    .then(product => {
        if(!product){
            res.status(404).json({message: 'Item does not exist'})
        }
        else{
            res.status(201).json({message: 'Item removed'})
        }
    })
    .catch(error => res.status(500).json({error}))
})


products.put('/add-to-inventory/:product_id', verifyToken(process.env.admin_secret_key), (req, res) => {
    Product.findOne({_id: req.params.product_id}).exec()
    .then(product => {
        product.stock_for_sale += parseInt(req.body.items_for_sale) || 0
        product.stock_for_rent += parseInt(req.body.items_for_rent) || 0
        product.save()
        .then(() => res.status(201).json({message: 'Inventory updated'}))
    })
    .catch(error => res.status(500).json({error}))
})


// only patients can post
products.post('/review', verifyToken(process.env.patient_secret_key), (req, res) => {
    const review = new Review({
        review_of: req.body.review_of,
        review_by: req.body.review_by,
        review: req.body.review,
        rating: req.body.rating
    })
    review.save((err) => {
        console.log('Review saved to database')
    })
    res.status(200).json({message: 'success'})
})



module.exports = products