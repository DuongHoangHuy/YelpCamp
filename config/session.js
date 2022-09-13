const MongoStore = require('connect-mongo');

const secret = process.env.SECRET || 'thisisasecret'

const store = new MongoStore({
    mongoUrl: process.env.DB_URL,
    secret,
    // resave: false, //don't save session if unmodified
    touchAfter: 24 * 3600 // time period in seconds to resave
})

const sessionConfig = {
    name: 'blaahhh', // For hide the sesion
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, //HTPPS
        expires: Date.now()+1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}

module.exports = sessionConfig