const Campground = require('../models/campground')

module.exports.renderIndex = async(req, res)=>{
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res)=>{
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res)=>{
    const campground = new Campground({...req.body.campground, author: req.user._id})
    await campground.save()
    req.flash('success', 'Successfully make a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.renderShowForm = async(req, res)=>{
    try {
        const campground = await Campground.findById(req.params.id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }}
            ).populate('author')
        res.render('campgrounds/show', { campground })
    }catch(e){
        req.flash('error', 'Can not find that campground')
        res.redirect('/campgrounds')
    }
}

module.exports.renderEditForm = async (req, res)=>{
    try {
        const campground = await Campground.findById(req.params.id)
        res.render('campgrounds/edit', { campground })
    }catch(e){
        req.flash('error', 'Can not find that campground')
        res.redirect('/campgrounds')
    }
}

module.exports.editCampground = async (req, res)=>{
    await Campground.findByIdAndUpdate(req.params.id, req.body.campground)
    req.flash('success', 'Successfully update')
    res.redirect(`/campgrounds/${req.params.id}`)
}

module.exports.deleteCampground = async (req, res)=>{
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success', 'Successfully delete')
    res.redirect('/campgrounds')
}