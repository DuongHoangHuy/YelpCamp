const User = require('../models/user')

module.exports.renderRegisterForm =  (req, res)=>{
    res.render('users/register')
}

module.exports.registerUser = async (req, res, next)=>{
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
}

module.exports.renderLogInForm = (req, res)=>{
    res.render('users/login')
}

module.exports.logInUser = (req, res)=>{
    req.flash('success', 'Successful login')
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logOutUser = (req, res)=>{
    req.logout()
    req.flash('success', 'See yaa')
    res.redirect('/campgrounds')
}