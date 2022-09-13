const v1Router = require('express').Router()
const campgroundRouter = require('./campground')
const reviewRouter = require('./review')
const userRouter = require('./user')

v1Router.use('/', userRouter)
v1Router.use('/campgrounds', campgroundRouter)
v1Router.use('/campgrounds/:id/reviews', reviewRouter)

module.exports = v1Router