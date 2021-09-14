const express = require('express')
const Campground = require('../models/campground')
const asyncHandler = require('../utils/asyncHandler')
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')
const campgrounds = require('../controllers/campgrounds')
const router = express.Router()

router.route('/')
    .get(asyncHandler(campgrounds.renderIndex))
    .post(isLoggedIn, validateCampground ,asyncHandler(campgrounds.createCampground))
    
router.get('/new',isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(campgrounds.renderShowForm)
    .put(isLoggedIn, isAuthor ,validateCampground, asyncHandler(campgrounds.editCampground))
    .delete(isLoggedIn, isAuthor, asyncHandler(campgrounds.deleteCampground))
    
router.get('/:id/edit',isLoggedIn, isAuthor , asyncHandler(campgrounds.renderEditForm))



module.exports = router