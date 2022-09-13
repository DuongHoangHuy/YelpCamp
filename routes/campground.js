const express = require('express')
const Campground = require('../models/campground')
const asyncHandler = require('../utils/asyncHandler')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer')
const { storage } = require('../config/cloudinary')
const router = express.Router()

const upload = multer({ storage })

router.route('/')
    .get(asyncHandler(campgrounds.renderIndex))
    .post(isLoggedIn, upload.array('image'), validateCampground, asyncHandler(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(campgrounds.renderShowForm)
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, asyncHandler(campgrounds.editCampground))
    .delete(isLoggedIn, isAuthor, asyncHandler(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, asyncHandler(campgrounds.renderEditForm))



module.exports = router