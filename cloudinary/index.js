const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


//associate cloudinary with your credentials
cloudinary.config({   
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,

})

//set up cloudinary storage so images can be stored here
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'YelpCamp',  //folder in which where we are storing cloudinary images
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
})

module.exports = {
    cloudinary,
    storage,
}