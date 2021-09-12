const mongoose = require('mongoose')
const { campgroundSchema } = require('../schemas')
const Review = require('./review')
const {Schema} = mongoose

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    image: String,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

//Query middleware
CampgroundSchema.post('findOneAndDelete', async function(campground){
    if(campground.reviews.length){
        await Review.deleteMany({
            _id: {$in: campground.reviews}
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)