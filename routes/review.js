const express = require('express')
const Campground = require('../models/campground')
const Review = require('../models/review')
const asyncHandler = require('../utils/asyncHandler')
const router = express.Router({mergeParams: true}) //different folder
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')
const reviews = require('../controllers/reviews')

router.post('/',isLoggedIn, validateReview, reviews.createReview)

router.delete('/:reviewId',isLoggedIn,isReviewAuthor, asyncHandler(reviews.deleteReview))

module.exports = router