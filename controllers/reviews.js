
const Campground = require('../models/campground'); //access schema file 
const Review = require('../models/review');



module.exports.createReview = async(req, res) => {
    const campground = await Campground.findById(req.params.id); //obtain campground that the review is being added to and set to campground
    const review = new Review(req.body.review);  //craete new review through review.js Schema using inputs from review request form
    review.author  = req.user._id; //add author to review
    campground.reviews.push(review); //add review to campground review property 
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async(req,res) => {   
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});    
    //pull all elements that contains the specific reviewId out of the array reviews (which is located in each Campground object)
    //AKA DELETES THE REVIEW ID ELEMENT FROM THE ARRAY IN THE KEY/PROPERTY REVIEWS
    await Review.findByIdAndDelete(reviewId);//delete the actual review object
    req.flash('success', 'Deleted review!');
    res.redirect(`/campgrounds/${id}`);
}