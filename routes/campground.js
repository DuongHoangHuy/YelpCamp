const express = require('express')
const Campground = require('../models/campground')
const asyncHandler = require('../utils/asyncHandler')
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')
const router = express.Router()


router.get('/', asyncHandler(async(req, res)=>{
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

router.get('/new',isLoggedIn, (req, res)=>{
    res.render('campgrounds/new')
})

router.post('/',isLoggedIn, validateCampground ,asyncHandler(async (req, res)=>{
    const campground = new Campground({...req.body.campground, author: req.user._id})
    await campground.save()
    req.flash('success', 'Successfully make a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', async(req, res)=>{
    try {
        const campground = await Campground.findById(req.params.id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }}
            ).populate('author')
        console.log(campground.reviews)
        res.render('campgrounds/show', { campground })
    }catch(e){
        req.flash('error', 'Can not find that campground')
        res.redirect('/campgrounds')
    }
})

router.get('/:id/edit',isLoggedIn, isAuthor , asyncHandler(async (req, res)=>{
    try {
        const campground = await Campground.findById(req.params.id)
        res.render('campgrounds/edit', { campground })
    }catch(e){
        req.flash('error', 'Can not find that campground')
        res.redirect('/campgrounds')
    }
}))

router.put('/:id',isLoggedIn, isAuthor ,validateCampground, asyncHandler(async (req, res)=>{
    await Campground.findByIdAndUpdate(req.params.id, req.body.campground)
    req.flash('success', 'Successfully update')
    res.redirect(`/campgrounds/${req.params.id}`)
}))

router.delete('/:id',isLoggedIn, isAuthor, asyncHandler(async (req, res)=>{
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success', 'Successfully delete')
    res.redirect('/campgrounds')
}))

module.exports = router