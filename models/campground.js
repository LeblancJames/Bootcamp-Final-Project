const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')

const ImageSchema = new Schema ({
    url: String,
    filename: String,  
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200');
})


const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    images: [ImageSchema],
    author:{
        type: Schema.Types.ObjectId, //obtain object id...
        ref: 'User',//...that references the database collection 'User' to find it
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,  
            ref: 'Review'  
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function (doc){  
    //findbyidanddelete method in app.js uses the findoneanddelete (query type) middleware //see mongoose docs for more info
    //this takes the document/object in the collection as a parameter
    if(doc){  //ensures that document/object exists
        await Review.deleteMany({  //access the review collection
            _id:{   //check if id in reviews collection ->
                $in: doc.reviews   //-> is in our document/object reviews property and delete it 
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)    
//Create collection called campground using campgroundschema for each object in collection. //will pluralize collection name automatically