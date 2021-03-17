const User = require('../models/User');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');

//protect routes
exports.protect = asyncHandler (async (req,res,next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    //make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route..',401));
    }

    try {
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // console.log('DECODE-->>',decoded);

        req.user = await User.findById(decoded.id); //currently loggedIn user
        next();

    } catch (err) {
        return next(new ErrorResponse('Not authorized to access this route..',401));
    }
});

//grant access to soecific roles
exports.authorize = (...roles) => {
    return (req,res,next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`Person of '${req.user.role}' role is not authorized to access this route`,403));
        }
        next();
    }
}