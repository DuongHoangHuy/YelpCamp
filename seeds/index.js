const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors, imageUrls, reviews} = require('./seedHelpers');
const Campground = require('../models/campground');
const Review = require('../models/review')
require('dotenv').config()
'mongodb://localhost:27017/yelp-camp'
mongoose.connect(process.env.DB_URL)

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

function getRandomImages(){
    const arr = []
    for(let i = 0; i < 3; ++i){
        const random20 = Math.floor(Math.random()*20)
        arr.push({
            url: imageUrls[random20],
            filename: imageUrls[random20].slice(imageUrls[random20].indexOf('YelpCamp'), imageUrls[random20].length-4)
        })
    }
    return arr
}

async function getRandomeReviews(){
    const arr = []
    for(let i = 0; i < 5; ++i){
        const review = new Review({
            body: reviews[Math.floor(Math.random()*100)],
            rating: Math.floor(Math.random()*5)+1,
            author: '61533087f1ad7fc6e6419296'
        })
        await review.save()
        arr.push(review._id)
    }
    return arr
}

const seedDB = async () => {
    await Campground.deleteMany({});
    await Review.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 40) + 10
        const camp = new Campground({
            author: '6144260178bccd7fda1f2a18',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga tenetur aut possimus dolorum modi. Architecto iusto nemo, sed rerum repudiandae magnam voluptates eveniet illum voluptatem ab beatae quisquam deleniti soluta Est hic vero ab vitae excepturi soluta amet tenetur laudantium, fuga porro minus accusantium laboriosam sed eveniet expedita ipsum voluptates corporis. Aspernatur nostrum autem, illo magnam iure facere repellat maxime.',
            price: price,
            geometry:{
                type : "Point", 
                coordinates : [cities[random1000].longitude, cities[random1000].latitude] 
            },
            images: getRandomImages(),
            reviews: await getRandomeReviews()
        })
        await camp.save();

    }

    
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    })
