const Campground = require('../models/campground')
const { campgroundSchema } = require('../schemas')
const { cloudinary }  = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const campground = require('../models/campground');
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken: mapBoxToken})

module.exports.renderIndex = async (req, res) => {
    let campgrounds = await Campground.find({}).populate('reviews','rating')
    const lengthBefore = campgrounds.length
    let lengthAfter, search = false
    if(req.query.title !== undefined && req.query.title !== ''){
        const Regex = new RegExp(req.query.title, 'i')
        campgrounds = campgrounds.filter(campground => Regex.test(campground.title))
        lengthAfter = campgrounds.length
        search = true
    }else{
        lengthAfter = lengthBefore
    }
    let averageRatings = campgrounds.map(campground => calAverageRating(campground))
    res.render('campgrounds/index', { campgrounds, lengthAfter, lengthBefore, search, averageRatings })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground({ ...req.body.campground, author: req.user._id })
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.geometry = geoData.body.features[0].geometry
    await campground.save()
    console.log(campground)
    req.flash('success', 'Successfully make a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.renderShowForm = async (req, res) => {
    try {
        let campground = await Campground.findById(req.params.id).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author')
        let reviews = campground.reviews
        const ratingSelect = parseInt(req.query.rating)
        if(ratingSelect >= 1 && ratingSelect <= 5){
            reviews = reviews.filter(review => review.rating === ratingSelect)
        }
        const averageRating = calAverageRating(campground)
        res.render('campgrounds/show', { campground, averageRating, reviews, ratingSelect})
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/campgrounds')
    }
}

module.exports.renderEditForm = async (req, res) => {
    try {
        const campground = await Campground.findById(req.params.id)
        res.render('campgrounds/edit', { campground })
    } catch (e) {
        req.flash('error', 'Can not find that campground')
        res.redirect('/campgrounds')
    }
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            const a = await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id)
    req.flash('success', 'Successfully delete')
    res.redirect('/campgrounds')
}

//________________FUNCTION__________________
function calAverageRating(campground){
    const reviews = campground.reviews
    let sum = 0
    if(reviews && reviews.length){
        reviews.forEach(el =>{sum += el.rating})
        sum /= reviews.length
    }
    return Math.round(sum*10)/10
}