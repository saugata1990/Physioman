const express = require('express')
const app = express()
const products = require('./routes/products')
const physios = require('./routes/physios')
const patients = require('./routes/patients')
const admin = require('./routes/admin')
const services = require('./routes/services')
const consultants = require('./routes/consultants')
const sessions = require('./routes/sessions')
const bookings = require('./routes/bookings')
const orders = require('./routes/orders')
const incidents = require('./routes/incidents')
const logistics = require('./routes/deliveryMan')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')

app.use(cors())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}))
app.use(bodyParser.json({limit: '50mb'}))
app.use(express.static('./images'))

app.use('/api/products', products)
app.use('/api/physios', physios)
app.use('/api/patients', patients)
app.use('/api/admin', admin)
app.use('/api/services', services)
app.use('/api/consultants', consultants)
app.use('/api/sessions', sessions)
app.use('/api/bookings', bookings)
app.use('/api/orders', orders)
app.use('/api/incidents', incidents)
app.use('/api/logistics', logistics)

app.listen(process.env.PORT || 3000, ()=>console.log('server is listening'))