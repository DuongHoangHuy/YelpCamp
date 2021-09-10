const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const Campground = require('./models/campground')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const asyncHandler = require('./utils/asyncHandler')
const Joi = require('joi')
const {campgroundSchema} = require('./schemas')
const app = express()

//Initial Connection
mongoose.connect('mongodb://localhost:27017/yelp-camp')

//handle errors after initial connection
const db = mongoose.connection
db.on('error', err => {
    console.log(err);
  });
db.once('open', ()=> {console.log('Database connected')})

//Set up
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.engine('ejs', ejsMate)


const validateCampground = (req, res, next)=>{
    const {error} = campgroundSchema.validate(req.body)
    if(error){
        const msg = error.details.map(e => e.message).join(', ') //can have many object in array
        throw new ExpressError(msg, 400)
    }
    next()
}

//Routing
app.get('/', (req, res)=>{
    res.render('home.ejs')
})

app.get('/campgrounds', asyncHandler(async(req, res)=>{
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

app.get('/campgrounds/new', (req, res)=>{
    res.render('campgrounds/new')
})

app.post('/campgrounds',validateCampground ,asyncHandler(async (req, res)=>{
    if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id', asyncHandler(async (req, res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground })
}))

app.get('/campgrounds/:id/edit', asyncHandler(async (req, res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground })
}))

app.put('/campgrounds/:id',validateCampground, asyncHandler(async (req, res)=>{
    await Campground.findByIdAndUpdate(req.params.id, req.body.campground)
    res.redirect(`/campgrounds/${req.params.id}`)
}))

app.delete('/campgrounds/:id', asyncHandler(async (req, res)=>{
    await Campground.findByIdAndDelete(req.params.id)
    res.redirect('/campgrounds')
}))

// Error handler
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