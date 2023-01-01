const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review');
const Campground = require('../models/campground'); //access schema file 
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const review = require('../controllers/reviews');


router.post('/', isLoggedIn, validateReview, catchAsync(review.createReview));
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(review.deleteReview));

module.exports = router;