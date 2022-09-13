if(process.env.NODE_ENV !== 'production'){ // currently in dev mode
    require('dotenv').config()
}

const express = require('express')
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
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const app = express()

const {connectMongoDB} = require('./services/connectionsMongo')
const sessionConfig = require('./config/session')
const helmetConfig = require('./config/sercurity')
const v1Router = require('./routes/v1Router')
const http = require('http')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.engine('ejs', ejsMate)

app.use(session(sessionConfig))
app.use(flash())

//SECURITY
app.use(mongoSanitize())
app.use(helmet())
app.use(helmet.contentSecurityPolicy(helmetConfig));


//AUTHENTICATION
app.use(passport.initialize()) //passport
app.use(passport.session()) //passport
passport.use(new LocalStrategy(User.authenticate())); // passport-local-mongoose
passport.serializeUser(User.serializeUser()); // passport-local-mongoose
passport.deserializeUser(User.deserializeUser());// passport-local-mongoose

//MIDDLEWARE
app.use((req, res, next)=>{
    res.locals.currentUser = req.user 
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.get('/', (req, res)=>{
    res.render('home.ejs')
})

app.use('/v1', v1Router)

//__________________ERROR HANDLER_________________
app.all('*', (req, res)=>{
    throw new ExpressError('Page not found', 404)
})

app.use((err, req, res, next)=>{
    const {message = 'Something went wrong', statusCode = 500} = err
    res.status(statusCode).render('error', {message, statusCode, err})
})

const port = process.env.PORT || 8000
const startServer = async ()=>{
    try {
        await connectMongoDB()
        http.createServer(app).listen(port, ()=>{
            console.log(`Listening port ${port}`)
        })
    }catch(err){
        console.log(`Server cannot start with error: ${err}`)
    }
}

startServer()