const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err,req,res,next) => {
    let error = {... err};
    error.message = err.message;
    
    console.log(err.stack.red);
    console.log('ERROR-----------\n',err);
    console.log('--------------\n');

    //mongoose incorrect objectId 
    if(err.name === 'CastError'){
        const message = `Resource with id:${err.value} is Not Found! `;
        error = new ErrorResponse(message,404);
    }
    //mongoose duplicate key
    if(err.code === 11000){
        const message = `Duplicate Value entered in the field!`;
        error = new ErrorResponse(message,400);
    }
    //mongoose validation error
    if(err.name === 'ValidationError'){
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message,400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error!',
    });
}

module.exports = errorHandler;