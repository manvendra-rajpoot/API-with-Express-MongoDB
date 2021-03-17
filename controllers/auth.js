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

    //create token
    const token = user.getSignedJwtToken(); /*This is defined in model */

    res.status(200).json({
        success: true,
        token: token,
    });
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

    //create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
        success: true,
        token: token,
    });
});