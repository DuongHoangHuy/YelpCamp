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

router.post('/',validateReview, asyncHandler(async(req, res)=>{
    const {id} = req.params
    const campground = await Campground.findById(id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    res.redirect('/campgrounds/'+id)
}))

router.delete('/:reviewId', asyncHandler(async(req, res)=>{
    const {id, reviewId} = req.params
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}) //pull: remove element from array
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router