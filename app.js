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
const LocalStrategy = require('passport-local') //Strategy for login by username+passord
const MongoStore = require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
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
app.use(session(sessionConfig))
app.use(flash())
// Securtity: NO SQL injection
app.use(mongoSanitize())

app.use(helmet())


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit.fontawesome.com/",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdnjs.cloudflare.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://ka-f.fontawesome.com/"
];

const fontSrcUrls = [
    "https://ka-f.fontawesome.com/"
]

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'unsafe-inline'","'self'" , ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/project-storage/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


//__________________PASSPORT______________
app.use(passport.initialize()) //passport
app.use(passport.session()) //passport
passport.use(new LocalStrategy(User.authenticate())); // passport-local-mongoose
passport.serializeUser(User.serializeUser()); // passport-local-mongoose
passport.deserializeUser(User.deserializeUser());// passport-local-mongoose



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
    res.status(statusCode).render('error', {message, statusCode, err})
})

const port = process.env.PORT || 8000
app.listen(port, ()=>{
    console.log(`Listening port ${port}`)
})