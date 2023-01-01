const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const users = require('../controllers/user');


//register page
router.route('/register')
    .get(users.renderRegister)
    //create user account. Display errors if one exists such as duplicate username.
    .post(catchAsync(users.register))



//login page
router.route('/login')
    .get(users.renderLogin)
    //login request. passport middleware - strategy to authenticate with is local. flash failure message if failed, go back to login if failed.
    //if successfully authenticated, flash message and redirect
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login', keepSessionInfo: true}), users.Login)


//logout page
router.get('/logout', users.Logout);


module.exports = router;
