const User = require('../models/user');


module.exports.renderRegister = (req, res) => {
    res.render('user/register');
}

module.exports.register = async(req,res, next) => {
    try {
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {      //after user registers, login registered user 
        if(err) return next(err);
        req.flash('success', 'Welcome!');
        res.redirect('/campgrounds');
    });
    } catch(e){   
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('user/login');
}

module.exports.Login = (req, res) => {
    
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds'; //set route to return to or /campgrounds if they used login button
    delete req.session.returnTo;  
    //console.log(redirectUrl);
    res.redirect(redirectUrl);
}

module.exports.Logout = (req, res, next) => {
    req.logout(function(err) {     //automatically creates logout request method with passport
        if (err) { return next(err); }
        req.flash('success', 'Logout Successful');
        res.redirect('/campgrounds');
    });
    
}