const express = require('express')
const User = require('../models/user')
const passport = require('passport')
const users = require('../controllers/users')
const router = express.Router()

router.route('/register')
    .get(users.renderRegisterForm)
    .post(users.registerUser)

router.route('/login')
    .get(users.renderLogInForm)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: `/${process.env.CURRENT_VERSION}/login`}), users.logInUser)

router.get('/logout', users.logOutUser)

module.exports = router