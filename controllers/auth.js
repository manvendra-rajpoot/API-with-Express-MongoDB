const User = require('../models/User');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');


//@describe      Register a user
//@route         POST /api/v1/auth/register
//@access        Public
exports.register = asyncHandler(async (req,res,next) => {
    const {name, email, password, role} = req.body;

    //create user
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendTokenResponse(user, 200, res);
});

//@describe      Login a user
//@route         POST /api/v1/auth/login
//@access        Public
exports.login = asyncHandler(async (req,res,next) => {
    const {email, password} = req.body;

    //validate email and pswd
    if(!email || !password){
        return next(new ErrorResponse('Please provide your email & password..',400));
    }

    //check user
    const user = await User.findOne({email: email}).select('+password'); 
    /*select is needed to be set true here becoz while declaring schema we declare by default as false*/

    if(!user){
        return next(new ErrorResponse('Invalid credentials..',401));
    }

    //check password
    const isMatch = await user.matchPassword(password);

    if(!isMatch){
        return next(new ErrorResponse('Invalid credentials..',401));
    }

    sendTokenResponse(user, 200, res);
});

//Get Token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    //create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * (60 * 60 * 24 * 1000)),
        httpOnly: true,
    }

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token',token,options).json({
        success: true,
        token
    });
}

//@describe      Get a current logged User
//@route         GET /api/v1/auth/me
//@access        Public
exports.getMe = asyncHandler(async (req,res,next) => {
    const user = await User.findById(req.user.id); //since it is protected user we have access to req.user

    res.status(200).json({
        success: true,
        data: user,
    });
});