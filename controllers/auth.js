const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');


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

//@describe      update details
//@route         PUT /api/v1/auth/updatedetails
//@access        Private
exports.updateDetails = asyncHandler(async (req,res,next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
    }
    
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true,
    }); 

    res.status(200).json({
        success: true,
        data: user,
    });
});

//@describe      change pswd
//@route         PUT /api/v1/auth/changepassword
//@access        Private
exports.changePassword = asyncHandler(async (req,res,next) => {
    const user = await User.findById(req.user.id).select('+password'); 

    //check curr password
    const isMatch = await user.matchPassword(req.body.currPassword);

    if(!isMatch){
        return next(new ErrorResponse('Invalid credentials..',401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});

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

//@describe      Forgot password
//@route         POST /api/v1/auth/forgotpassword
//@access        Public
exports.forgotPassword = asyncHandler ( async (req,res,next) => {
    const user = await User.findOne({email: req.body.email}); 

    if (!user) {
        return next(new ErrorResponse(`No user found linked with ${req.body.email}`,404));
    }

    //get reset TOKEN
    const resetToken = user.getResetPasswordToken();

    // console.log('resetToken: ',resetToken);
    await user.save({
        validateBeforeSave: false,
    });

    //create resetUrl
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`
    const message = `You are receiving this email since you (or someone else) has requested to reset the password of your account. Make a PUT request to do so at:\n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Token',
            message: message,
        }); 

        res.status(200).json({
            success: true,
            message: 'Email sent!'
        });

    } catch (err) {
        console.error(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({
            validateBeforeSave: false,
        });

        return next(new ErrorResponse('Email could not be sent!',500));
    }
});

//@describe      Reset Password
//@route         PUT /api/v1/auth/resetpassword/:resettoken
//@access        Public
exports.resetPassword = asyncHandler(async (req,res,next) => {
    //get hashed pswd
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    }); 

    if (!user) {
        return next(new ErrorResponse('Invalid TOKEN!',400));
    }

    //set password
    user.password = req.body.password; 
    user.resetPasswordToken = undefined; /*Pswd is changed so no more required */
    user.resetPasswordExpire = undefined;
    await user.save();
    
    sendTokenResponse(user, 200, res);
});


//Get Token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    //create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 60 * 60 * 24 * 1000),
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