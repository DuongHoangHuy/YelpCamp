if(process.env.NODE_ENV !== 'production'){ // currently in dev mode
    require('dotenv').config()
}

const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const campgroundRoute = require('./routes/campground')
const reviewRoute = require('./routes/review')
const userRoute = require('./routes/user')
const session = require('express-session')
const flash = require('connect-flash')
const User = require('./models/user')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const MongoStore = require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize');
const app = express()

//I__________________CONNECTION______________________
// 'mongodb://localhost:27017/yelp-camp'
// process.env.DB_URL ||
const dbUrl = 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl)

//handle errors after initial connection
const db = mongoose.connection
db.on('error', err => {
    console.log(err);
  });
db.once('open', ()=> {console.log('Database connected')})

//___________________MIDDLEWARE_________________
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.engine('ejs', ejsMate)

const secret = process.env.SECRET || 'thisisasecret'

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    // resave: false, //don't save session if unmodified
    touchAfter: 24 * 3600 // time period in seconds to resave
})

const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now()+1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())
// Securtity: NO SQL injection
app.use(mongoSanitize());
//__________________PASSPORT______________
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate())); // Create new method
passport.serializeUser(User.serializeUser()); // How to store user in session
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

//__________________ROUTES_________________
app.get('/', (req, res)=>{
    res.render('home.ejs')
})

app.use('/', userRoute)
app.use('/campgrounds', campgroundRoute)
app.use('/campgrounds/:id/reviews', reviewRoute)

//__________________ERROR HANDLER_________________
app.all('*', (req, res)=>{
    throw new ExpressError('Page not found', 404)
})

app.use((err, req, res, next)=>{
    const {message = 'Something went wrong', statusCode = 500} = err
    res.status(statusCode).render('error', {message, statusCode})
})

const port = process.env.PORT || 3000
app.listen(port, ()=>{
    console.log(`Listening port ${port}`)
})