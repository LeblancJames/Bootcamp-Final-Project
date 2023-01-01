const {validatecampgroundSchema, reviewSchema} = require('./validationSchemas')
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground'); //access schema file 
const Review = require('./models/review');


module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){  //check for authetnication aka is logged in
        req.session.returnTo = req.originalUrl;  //set 'returnTo' to the url that user came from 
        req.flash('error', 'Account Required');
        return res.redirect('/login');  //return redirect to not call line outside of if statement
    }  
    next();
}


module.exports.validateCampground = (req, res, next) => {
    
    const {error} = validatecampgroundSchema.validate(req.body);  //destructure error portion from result. pass data through to schema to validate. 
    if (error){
        const msg = error.details.map(el => el.message).join(',')  //for each element in error, combine into a single string
        throw new ExpressError(msg, 400) //create an error using msg and error code 400
    }else{
        next();
    }
}


module.exports.isAuthor = async(req, res, next) => {
    const {id} = req.params;   //destructure id from url parameter  
    const campground = await Campground.findById(id);    //find campground in collection Campground
    if(!campground.author.equals(req.user._id)){  //check for authorization; if author does not equal id return error
        req.flash('error', 'denied');
        res.redirect(`/campgrounds/${id}`);
    }
    next();
} 



module.exports.isReviewAuthor = async(req, res, next) => {
    const {id, reviewId} = req.params;   //destructure id from url parameter  
    const review = await Review.findById(reviewId);    //find campground in collection Campground
    if(!review.author.equals(req.user._id)){  //check for authorization; if author does not equal id return error
        req.flash('error', 'denied');
        res.redirect(`/campgrounds/${id}`);
    }
    next();
} 

module.exports.validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body); 
    if (error){
        const msg = error.details.map(el => el.message).join(',') 
        throw new ExpressError(msg, 400) 
    }else{
        next();
    }
}   