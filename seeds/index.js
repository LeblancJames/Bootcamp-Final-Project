const mongoose = require('mongoose');
const Campground = require('../models/campground'); //access schema file   //extra period to access path 
const cities = require('./cities');  //access cities file
const {places, descriptors} = require('./seedHelpers') //access and destructure seedsHelpers file 

mongoose.set("strictQuery", false);  //allow filtering properities not in schema //new; gave deprication error if not added
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp'); 

const db = mongoose.connection;
db.on('error',console.error.bind(console, 'connection error:'));   //if error occurs after connecting
db.once('open', () => {     //event will be called once the first time the connection is made
    console.log('Database connected');
})


const sample = array => array[Math.floor(Math.random() * array.length)];  //access random object in array of objects

const seedDB = async () => {
    await Campground.deleteMany({});   //delete all items in collection
    for(let i = 0; i < 50; i++){   //create loop for 50 campgrounds
        const random1000 = Math.floor(Math.random() * 1000);    //random number between 0-1000
        const price = Math.floor(Math.random() * 20) + 10; //random number for price 
        const camp = new Campground({        //create new camp object using campground schema and add location 
            author: '63af638ab91bb9d456e453ca', 
            location: `${cities[random1000].city}, ${cities[random1000].state}`,   
            //use random variable to determine random city and access its 'city' and 'state' properties
            title: `${sample(descriptors)} ${sample(places)}`,  //create title using sample function. Use descriptor and places arrays as arguments/inputs
            description: 'lorem ipsum',
            price, //autosets to price, no need to re-set it to price
            images: [
                {
                  url: 'https://res.cloudinary.com/dyy5trjg7/image/upload/v1672439071/YelpCamp/ben-pitasky-_kt86w_to0A-unsplash_chhv1h.jpg',
                  filename: 'YelpCamp/lifn3cmmtkypswikebxn',
                 
                },
            ]
        })
        await camp.save();   //save camp object to database
    }
}


seedDB().then(() => { //seedDB is async function so it returns promise; once function is executed, close the connection. You do not need to access database after this function runs once.
    mongoose.connection.close();  
});   