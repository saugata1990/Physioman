const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/reviews'

const Schema = mongoose.Schema
mongoose.Promise = global.Promise
const db = mongoose.createConnection(process.env.mongo_url)

const reviewSchema = new Schema({
    review_of_product: String, // product_id
    review_by: String, // customer_id
    review: String,
    rating: Number
})

const Review = db.model('Review', reviewSchema)

module.exports = Review