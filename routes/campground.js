const express = require('express')
const Campground = require('../models/campground')
const ExpressError = require('../utils/ExpressError')
const asyncHandler = require('../utils/asyncHandler')
const {campgroundSchema} = require('../schemas')
const router = express.Router()

const validateCampground = (req, res, next)=>{
    const {error} = campgroundSchema.validate(req.body)
    if(error){
        const msg = error.details.map(e => e.message).join(', ') //can have many object in array
        throw new ExpressError(msg, 400)
    }
    next()
}

router.get('/', asyncHandler(async(req, res)=>{
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

router.get('/new', (req, res)=>{
    res.render('campgrounds/new')
})

router.post('/',validateCampground ,asyncHandler(async (req, res)=>{
    const campground = new Campground(req.body.campground)
    await campground.save()
    req.flash('success', 'Successfully make a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', async(req, res)=>{
    try {
        const campground = await Campground.findById(req.params.id).populate('reviews')
        res.render('campgrounds/show', { campground })
    }catch(e){
        req.flash('error', 'Can not find that campground')
        res.redirect('/campgrounds')
    }
})

router.get('/:id/edit', asyncHandler(async (req, res)=>{
    try {
        const campground = await Campground.findById(req.params.id)
        res.render('campgrounds/edit', { campground })
    }catch(e){
        req.flash('error', 'Can not find that campground')
        res.redirect('/campgrounds')
    }
}))

router.put('/:id',validateCampground, asyncHandler(async (req, res)=>{
    await Campground.findByIdAndUpdate(req.params.id, req.body.campground)
    req.flash('success', 'Successfully update')
    res.redirect(`/campgrounds/${req.params.id}`)
}))

router.delete('/:id', asyncHandler(async (req, res)=>{
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success', 'Successfully delete')
    res.redirect('/campgrounds')
}))

module.exports = router