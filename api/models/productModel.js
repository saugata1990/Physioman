const mongoose = require('mongoose')
const url = 'mongodb://localhost:27017/physioman'

const Schema = mongoose.Schema
mongoose.plugin(require('mongoose-regex-search'))
mongoose.Promise = global.Promise
const db = mongoose.createConnection(process.env.mongo_url)

const productSchema = new Schema({
    product_model: {type: String, index:true, searchable: true}, 
    product_name: {type: String, index:true, searchable: true},
    product_manufacturer: {type: String, index:true, searchable: true}, 
    product_category: {type: String, index:true, searchable: true},
    product_specifications: {type: String, index:true, searchable: true},
    product_description: {type: String, index:true, searchable: true},
    search_tags: {type: String, index:true, searchable: true},
    selling_price: Number,
    rent_price: Number,
    product_image: {data: String, contentType: String},
    reviews: [String], // review_id's
    rating: Number,
    stock_for_sale: Number,
    stock_for_rent: Number
})

const Product = db.model('Product', productSchema)

module.exports = Product