module.exports = func => {
    return(req, res, next) => {
        func(req, res, next).catch(next);
    }
}

//allows you to wrap async functions so you do not have to type try, catch, next e constantly 
//takes in the function and runs the function with the .catch method and sends the error (if one was caught) to the next app.use in the file.