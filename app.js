const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const campgroundRoute = require('./routes/campground')
const reviewRoute = require('./routes/review')
const session = require('express-session')
const flash = require('connect-flash')
const app = express()

//I__________________CONNECTION______________________
mongoose.connect('mongodb://localhost:27017/yelp-camp')

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
const sessionConfig = {
    secret: 'thisisasecret',
    resave: false,
    saveUninitialized: true,
    cookies:{
        httpOnly: true,
        expires: Date.now()+1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use((req, res, next)=>{
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.get('/', (req, res)=>{
    res.render('home.ejs')
})
//__________________ROUTES_________________
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

app.listen(3000, ()=>{
    console.log('Listening port 3000')
})