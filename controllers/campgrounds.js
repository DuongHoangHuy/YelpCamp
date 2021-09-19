const Campground = require('../models/campground')
const { campgroundSchema } = require('../schemas')
const { cloudinary }  = require('../cloudinary');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken: mapBoxToken})

module.exports.renderIndex = async (req, res) => {
    let campgrounds = await Campground.find({})
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
    let averageRatings = []
    const getRating = campgrounds.map(el => el.averageRating)
    for await (let data of getRating){ // await data 
        averageRatings.push(data)
    }
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
        let campground = await Campground.findById(req.params.id)
        const averageRating = await campground.averageRating
        campground = await campground.populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }
        )
        res.render('campgrounds/show', { campground, averageRating})
    } catch (e) {
        req.flash('error', 'Can not find that campground')
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
    console.log(req.body);
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