const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp')

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 500; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 40) + 10
        const camp = new Campground({
            author: '613f663b86f557d578210f31',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Testing stage...',
            price: price,
            geometry:{
                type : "Point", 
                coordinates : [cities[random1000].longitude, cities[random1000].latitude] 
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/project-storage/image/upload/v1631683386/YelpCamp/jcrwaskm8qakjxlacd8x.jpg',
                    filename: 'YelpCamp/jcrwaskm8qakjxlacd8x'
                },
                {
                    url: 'https://res.cloudinary.com/project-storage/image/upload/v1631683389/YelpCamp/ujj1rmwwfsopacm9ajcf.jpg',
                    filename: 'YelpCamp/ujj1rmwwfsopacm9ajcf'
                },
            ]
        })
        await camp.save();
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    })