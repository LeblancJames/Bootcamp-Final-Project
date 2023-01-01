if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
mongoose.set("strictQuery", false);  //allow filtering properities not in schema //new; gave deprication error if not added

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const campgroundsRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const MongoDBStore = require('connect-mongo');

const localUrl = 'mongodb://127.0.0.1:27017/yelp-camp';
const dbUrl = process.env.DB_URL;
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');   //connect local database
//mongoose.connect(dbUrl);  

const db = mongoose.connection;
db.on('error',console.error.bind(console, 'connection error:'));   //if error occurs after connecting
db.once('open', () => {     //event will be called once the first time the connection is made
    console.log('Database connected');
})

const app = express ();


app.engine('ejs', ejsMate); //tell express to use ejs-mate engine instead of ejs
app.set('view engine', 'ejs');   //use ejs templating engine
app.set('views', path.join(__dirname, 'views'))   //tells express to use views folder for views  //if this line was not used, folder that is named 'views' will be used by default

app.use(express.urlencoded({extended: true}));  //deals with incoming post data using express 
app.use(methodOverride('_method')); 


const store = MongoDBStore.create({ 
	mongoUrl: localUrl,  
	secret: 'thisisyoursecret!',
	touchAfter: 24 * 60 * 60,
});

store.on('error', function(e) {
    console.log(e);
})

const sessionConfig = {     
    store,
    name: 'us_ses',     
    secret: 'thisisyoursecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),  //cookie expires in a week
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

app.use(session(sessionConfig)); 
//session creates a cookie and sends it. A hashed result is also generated using the cookie and secret.
//Upon returning the cookie, the cookie and secret are used to generate a hashed result again.
//the result is compared to the original result and they should be the same as before
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //authenticaate user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use(
    helmet.contentSecurityPolicy({
      directives: {
        "script-src": [
            "'self'", 
            "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js", 
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js',
            'https://cdn.jsdelivr.net/npm/bs-custom-file-input/dist/bs-custom-file-input.min.js'
        ],
        "style-src": [
            "'self'",
            "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css",
            "https://stackpath.bootstrapcdn.com/",
            
        ],
        "img-src": [
            "'self'",
            "https://images.unsplash.com/photo-1590354501456-74e9ef35d486?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
            "https://res.cloudinary.com/dyy5trjg7/",
            "blob:",
            "data:",
            "https://images.unsplash.com/",
            
        ],
      },
    })
  );
  


app.use((req, res, next) => {     //middleware; MUST set before route handlers
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');  
    res.locals.error = req.flash('error');
    next();
    //take the 'success' key-value pair created in campground js route and store it in res.local.success
})

app.get('/', (req, res) => {     //sets up homepage
    res.render('home')
})

app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);


app.use(express.static(path.join(__dirname, 'public')));//set default public files as public folder
app.use(mongoSanitize); //prevents characters like $ and . from being sent in query




app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})
// '*' means for all requests, return error 404. 
//However, order is important because this will only run if no other requests were matched. 

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    //destructure err obtained from ExpressError to obtain statusCode, set default to 500
    if(!err.message) err.message = 'Something Went Wrong';
    //if there is no error message, set it to this
    res.status(statusCode).render('error', {err})
    //render page error and send it err object. res.status(statuscodes) just lets the http server know the status error
})

app.listen(3000, () => {      //bind and listens to connections on port 3000
    console.log('serving on port 3000')
})

