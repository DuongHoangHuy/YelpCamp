const express = require('express')
const Campground = require('../models/campground')
const Review = require('../models/review')
const asyncHandler = require('../utils/asyncHandler')
const router = express.Router({mergeParams: true}) //different folder
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')

router.post('/',isLoggedIn, validateReview, async(req, res)=>{
    try{
        const {id} = req.params
        const campground = await Campground.findById(id)
        const review = new Review({...req.body.review, author: req.user._id})
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

router.delete('/:reviewId',isLoggedIn,isReviewAuthor, asyncHandler(async(req, res)=>{
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