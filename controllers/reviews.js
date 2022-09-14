const Review = require('../models/review')
const Campground = require('../models/campground')

const CURRENT_VERSION = process.env.CURRENT_VERSION

module.exports.createReview =  async(req, res)=>{
    try{
        const {id} = req.params
        const campground = await Campground.findById(id)
        const review = new Review({...req.body.review, author: req.user._id})
        campground.reviews.push(review)
        await campground.save()
        await review.save()
        req.flash('success', 'Successfully make a review')
        res.redirect(`/${CURRENT_VERSION}/campgrounds/${id}`)
    }catch(e){
        req.flash('error', 'Can not find that campground')
        res.redirect(`/${CURRENT_VERSION}/campgrounds`)
    }
}

module.exports.deleteReview = async(req, res)=>{
    const {id, reviewId} = req.params
    try{
        await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}) //pull: remove element from array
    }catch(e){
        req.flash('error', 'Can not find that campground')
        res.redirect(`/${CURRENT_VERSION}/campgrounds`)
    }
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully delete a review')
    res.redirect(`/${CURRENT_VERSION}/campgrounds/${id}`)
}