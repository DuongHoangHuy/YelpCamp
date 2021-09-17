const mongoose = require('mongoose')
const { campgroundSchema } = require('../schemas')
const Review = require('./review')
const {Schema} = mongoose

const opts = {toJSON: {virtuals: true}}
const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    geometry:{
        type: {
            type: String,
            enum: ['Point'],
            required: true
          },
          coordinates: {
            type: [Number],
            required: true
          }
    },
    images: [
        {
            url: String,
            filename: String
        }
    ],
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts)

CampgroundSchema.virtual('properties.popUpText').get( function(){
    return `<b><p><a href="/campgrounds/${this._id}">${this.title}</a></p></b><br><p>${this.description.substring(0, 25)}...</p>`
})

//Query middleware
CampgroundSchema.post('findOneAndDelete', async function(campground){
    if(campground.reviews && campground.reviews.length){
        await Review.deleteMany({
            _id: {$in: campground.reviews}
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)