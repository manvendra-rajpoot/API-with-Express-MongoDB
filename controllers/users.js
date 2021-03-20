const User = require('../models/User');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');

//@describe      Get all users
//@route         GET /api/v1/users
//@access        Private/Admin
exports.getUsers = asyncHandler(async (req,res,next) => {
    res.status(200).json(res.advancedSearch);
});

//@describe      Get a user
//@route         GET /api/v1/users/:id
//@access        Private/Admin
exports.getUser = asyncHandler(async (req,res,next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorResponse(`No user of Id:${req.params.id} is Found!`,404));
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});

//@describe      Create a user
//@route         POST /api/v1/users
//@access        Private/Admin
exports.addUser = asyncHandler(async (req,res,next) => {
    const user = await User.create(req.body);

    res.status(201).json({
        success: true,
        data: user,
    });
});

//@describe      update a user
//@route         PUT /api/v1/users/:id
//@access        Private/Admin
exports.updateUser = asyncHandler(async (req,res,next) => {
    let user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`No user of Id ${req.params.id} is Found!`, 404));
    }

    user = await User.findOneAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: user,
    });
});

//@describe      remove a user
//@route         DELETE /api/v1/users/:id
//@access        Private/Admin
exports.removeUser = asyncHandler(async (req,res,next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`No user of Id ${req.params.id} is Found!`, 404));
    }

    awaituser.remove();
    
    res.status(200).json({
        success: true,
        data: {},
    });
});