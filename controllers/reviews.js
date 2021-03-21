const Review = require('../models/Review');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const User = require('../models/User');


//@describe      Get all reviews
//@route         GET /api/v1/reviews
//@route         GET /api/v1/bootcamps/:bootcampId/reviews
//@access        Public
exports.getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews,
        });

    } else {
        res.status(200).json(res.advancedSearch);
    }
});

//@describe      Get single reviews
//@route         GET /api/v1/reviews/:id
//@access        Public
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description location.city',
    });
    if (!review) {
        return next(new ErrorResponse(`No review with id:${req.params.id} is Found!`, 404));
    }

    res.status(200).json({
        success: true,
        data: review,
    });
});

//@describe      Add a review 
//@route         POST /api/v1/bootcamps/:bootcampId/reviews
//@access        Private
exports.addReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId; //we want our Object to get registered at bootcamp of review model
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with id:${req.params.bootcampId} is Found!`, 404));
    }

    const review = await Review.create(req.body);

    res.status(201).json({
        success: true,
        data: review,
    });
});

//@describe      Update a review 
//@route         PUT /api/v1/reviews/:id
//@access        Private
exports.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`No review with id:${req.params.id} is Found!`, 404));
    }

    //checking if user is review owner or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        //This checks that user is not the owner of review & not the admin as well 
        return next(new ErrorResponse(`User of Id:${req.user.id} is not authorized to do this so!`, 401));
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: review
    });
});

//@describe      Delete a review 
//@route         DELETE /api/v1//reviews/:id
//@access        Private
exports.removeReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new ErrorResponse(`No review with id:${req.params.id} is Found!`, 404));
    }

    //checking if user is review owner or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        //This checks that user is not the owner of review & not admin as well
        return next(new ErrorResponse(`User of Id:${req.user.id} is not authorized to do this so!`, 401));
    }

    await review.remove();

    res.status(200).json({
        success: true,
        data: {},
    });
});