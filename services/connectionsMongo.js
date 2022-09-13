const mongoose = require('mongoose')

const MONGODB_URL = process.env.DB_URL ||'mongodb://localhost:27017/yelp-camp'

mongoose.connection.on('error', err => { console.log(err) });

mongoose.connection.once('open', ()=> {console.log('Database connected')})

const connectMongoDB = async()=>{
    await mongoose.connect(MONGODB_URL)
}

const disconnectMongoDB = async ()=>{
    await mongoose.disconnect()
}

module.exports = {connectMongoDB, disconnectMongoDB}