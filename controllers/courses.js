const Course = require('../models/Course');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');


//@describe      Get all courses 
//@route         GET /api/v1/courses
//@route         GET /api/v1/bootcamps/:bootcampId/courses
//@access        Public
exports.getCourses = asyncHandler( async (req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp:req.params.bootcampId }).populate({
            path: 'bootcamp',
            select: 'name description',
        });
        
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses,
        });

    } else {
        res.status(200).json(res.advancedSearch); 
    }
});

//@describe      Get single courses 
//@route         GET /api/v1/courses/:id
//@access        Public
exports.getCourse = asyncHandler( async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description location',
    });
    if (!course) {
        return next(new ErrorResponse(`No course with id:${req.params.id} is Found!`,404));
    }

    res.status(200).json({
        success: true,
        data: course,
    });
});

//@describe      Craete a course 
//@route         POST /api/v1/bootcamps/:bootcampId/courses
//@access        Private
exports.createCourse = asyncHandler( async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId; //we want our Object to get registered at bootcamp of course model
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with id:${req.params.bootcampId} is Found!`,404));
    }

    //checking if user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin' ) {
        //This checks that user is the owner & nt in admon role 
        return next(new ErrorResponse(`User of Id:${req.user.id} is not authorized to add course to this bootcamp of Id:${bootcamp._id}`, 401));
    }

    const course = await Course.create(req.body); 

    res.status(201).json({
        success: true,
        data: course
    });
});

//@describe      Update a course 
//@route         PUT /api/v1//courses/:id
//@access        Private
exports.updateCourse = asyncHandler( async (req, res, next) => {
    let course = await Course.findById(req.params.id);
    
    if (!course) {
        return next(new ErrorResponse(`No course with id:${req.params.id} is Found!`,404));
    }

    //checking if user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin' ) {
        //This checks that user is the owner & nt in admon role 
        return next(new ErrorResponse(`User of Id:${req.user.id} is not authorized to do this so!`, 401));
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: course
    });
});

//@describe      Delete a course 
//@route         DELETE /api/v1//courses/:id
//@access        Private
exports.deleteCourse = asyncHandler( async (req, res, next) => {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
        return next(new ErrorResponse(`No course with id:${req.params.id} is Found!`,404));
    }
    
    //checking if user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin' ) {
        //This checks that user is the owner & nt in admon role 
        return next(new ErrorResponse(`User of Id:${req.user.id} is not authorized to do this so!`, 401));
    }

    await course.remove();

    res.status(200).json({
        success: true,
        data: {},
        message: "The course is deleted",
    });
});