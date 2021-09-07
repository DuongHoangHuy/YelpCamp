const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const Campground = require('./models/campground')
const app = express()
//Initial Connection
mongoose.connect('mongodb://localhost:27017/yelp-camp')

//handle errors after initial connection
const db = mongoose.connection
db.on('error', err => {
    logError(err);
  });
db.once('open', ()=> {console.log('Database connected')})

//Set up
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({extended: true}))

//Routing

app.get('/', (req, res)=>{
    res.render('home.ejs')
})

app.get('/campgrounds', async(req, res)=>{
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
})

app.get('/campgrounds/new', (req, res)=>{
    res.render('campgrounds/new')
})

app.post('/campgrounds', async (req, res)=>{
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
})

app.get('/campgrounds/:id', async (req, res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground })
})

app.listen(3000, ()=>{
    console.log('Listening port 3000')
})