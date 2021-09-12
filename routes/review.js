const express = require('express')
const Campground = require('../models/campground')
const Review = require('../models/review')
const ExpressError = require('../utils/ExpressError')
const asyncHandler = require('../utils/asyncHandler')
const {reviewSchema} = require('../schemas')
const router = express.Router({mergeParams: true}) //different folder


const validateReview = (req, res, next)=>{
    const {error} = reviewSchema.validate(req.body)
    if(error){
        const msg = error.details.map(e => e.message).join(', ') //can have many object in array
        throw new ExpressError(msg, 400)
    }
    next()
}

router.post('/',validateReview, async(req, res)=>{
    try{
        const {id} = req.params
        const campground = await Campground.findById(id)
        const review = new Review(req.body.review)
        campground.reviews.push(review)
        await campground.save()
        await review.save()
        req.flash('success', 'Successfully make a review')
        res.redirect(`/campgrounds/${id}`)
    }catch(e){
        req.flash('error', 'Can not find that campground')
        res.redirect('/campgrounds')
    }
})

router.delete('/:reviewId', asyncHandler(async(req, res)=>{
    const {id, reviewId} = req.params
    try{
        await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}) //pull: remove element from array
    }catch(e){
        req.flash('error', 'Can not find that campground')
        res.redirect('/campgrounds')
    }
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully delete a review')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router