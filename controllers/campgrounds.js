const Campground = require('../models/campground'); //access schema file 
const {cloudinary} = require('../cloudinary');

module.exports.index = async (req, res) => {          //async required because we need to do something with the result campgrounds
    const campgrounds = await Campground.find({});  
    //find all campgrounds in collection and put it in constant campgrounds
    res.render('campgrounds/index', {campgrounds}); 
     //show the view located at campgrounds/index; and send campgrounds object over as a parameter
};

module.exports.renderNewForm = (req, res) => {  //this request must be before id or else error occurs because it will think 'new' is an id.
    res.render('campgrounds/new')//access template new.ejs that is used for creating a new campground
};

module.exports.createCampground = async (req, res, next) => {  //after you submit creation form, go here.
    
    const campground = new Campground(req.body.campground);  
    //take the files from the request and map the path and filename to url and filename of the images property of campgrounds
    campground.images = req.files.map( f => ({url: f.path, filename: f.filename}));  
    campground.author = req.user._id;  
    await campground.save(); //save campground to collection 
    req.flash('success', 'Successfully made new campground!'); 
    res.redirect(`/campgrounds/${campground._id}`); //redirect user to new campground 
    
};

module.exports.showCampground = async(req, res) => {  //create template for each id 
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author'); 
     //take the id parameter from the website-link/get-request and look for it in campground collection
     //popular campground object reviews key using their ids
     if(!campground){
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
     }
    res.render('campgrounds/show', { campground});    //render view using file show in campgrounds directory. send over specific campground parameter to show.ejs
}

module.exports.renderEditForm = async(req, res) => {    
    const campground = await Campground.findById(req.params.id);  
    res.render('campgrounds/edit', { campground });   
}

module.exports.updateCampground = async(req, res) => {

    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});   
    const imgs = req.files.map( f => ({url: f.path, filename: f.filename}));   //map files uploaded to imgs array
    campground.images.push(...imgs);  //pass each image as an argument to push via spread(so you dont push an entire array onto the images array)
    await campground.save();
    console.log(req.body)
//pull out of images array where filename is in deleteImages array from request.body
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            cloudinary.uploader.destroy(filename);//delete
        }
        await campground.updateOne({$pull: { images: {filename: {$in: req.body.deleteImages}}}})  
    }
    //find campground in database and spread data collected in edit.js body (campground[title] and campground[location]) as object into campground
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async( req,res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Succesfully deleted campground!')
    res.redirect('/campgrounds');
}