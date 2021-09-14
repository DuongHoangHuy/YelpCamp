const express = require('express')
const User = require('../models/user')
const passport = require('passport')
const router = express.Router()


router.get('/register', (req, res)=>{
    res.render('users/register')
})

router.post('/register', async (req, res, next)=>{
    try{
        const {username, password, email} = req.body
        const user = new User({username, email})
        const newUser = await User.register(user, password)
        req.login(newUser, (err)=>{                  // Log in after register
            if(err) return next(err)
            req.flash('success', 'Welcome to Yelpcamp')
            res.redirect('/campgrounds')
        })
    }catch(e){
        req.flash('error', e.message)
        res.redirect('/register')
    }
})

router.get('/login', (req, res)=>{
    res.render('users/login')
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res)=>{
    req.flash('success', 'Successful login')
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectUrl)
})

router.get('/logout', (req, res)=>{
    req.logout()
    req.flash('success', 'See yaa')
    res.redirect('/campgrounds')
})

module.exports = router