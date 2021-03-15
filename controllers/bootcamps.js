const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const path = require('path');


//@describe      Get all bootcamps
//@route         GET /api/v1/bootcamps
//@access        Public
exports.getBootcamps = asyncHandler( async (req, res, next) => {
    //copying req.query
    const reqQuery = {...req.query};

    //fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(field => delete reqQuery[field]);
    console.log(reqQuery);

    //creating query string
    let queryStr = JSON.stringify(reqQuery);

    //creating operators like as $gt, $lt, etc..
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|eq|ne|in|nin)\b/g, match => `$${match}`); // a/c to docs we need "$" before operators
    /*console.log(queryStr);*/

    //finding resources
    let query = Bootcamp.find(JSON.parse(queryStr)).populate('noOfCourses').populate({
        path: 'courses',
        select: 'title description tuition weeks',
    });

    //selecting fields to send back to client as per requirement
    if (req.query.select) {
        const selectBy = req.query.select.split(',').join(' '); 
        query = query.select(selectBy); 
    }

    //sorting fields to send back to client as per requirement
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' '); 
        query = query.sort(sortBy); 
    } else {
        query = query.sort('-createdAt');//default sort & "-" means in descending order 
    }

    //pagination
    const page = parseInt(req.query.page, 10) || 1, limit = parseInt(req.query.limit, 10) || 10;
    const startInd = ( page - 1 ) * limit, endInd = page * limit;
    const totalDocs = await Bootcamp.countDocuments();

    query = query.skip(startInd).limit(limit);

    //execute query
    const bootcamps = await query;

    //pagination result
    const pagination = {};
    
    if (endInd < totalDocs) {
        pagination.next = {
            page: page + 1,
            limit: limit
        }
    }
    if (startInd > 0) {
        pagination.prev = {
            page: page - 1,
            limit //same as limit:limit
        }
    }

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        pagination: pagination,
        data: bootcamps 
    }); 
});

//@describe      Get a bootcamp
//@route         GET /api/v1/bootcamps/:id
//@access        Public
exports.getBootcamp = asyncHandler( async (req, res, next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);

        if (!bootcamp) {
            return next(new ErrorResponse(`No bootcamp of id ${req.params.id} is Found!`, 404));
        }
        res.status(200).json({
            success: true,
            data: bootcamp
        });
});

//@describe      Craete a bootcamp
//@route         POST /api/v1/bootcamps
//@access        Private
exports.createBootcamp = asyncHandler( async (req, res, next) => {
        const bootcamp = await Bootcamp.create(req.body);
        
        res.status(201).json({
            success: true,
            data: bootcamp
        });
});

//@describe      Update a bootcamp
//@route         PUT /api/v1/bootcamps/:id
//@access        Private
exports.updateBootcamp = asyncHandler( async (req,res,next) => {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body,{
            new: true,
            runValidators: true,
        });

        if (!bootcamp) {
            return next(new ErrorResponse(`The bootcamp od id ${req.params.id} is not found!`, 404));
        }
        res.status(200).json({
            success: true,
            data: bootcamp
        });
});



//@describe      Delete a bootcamp
//@route         DELETE /api/v1/bootcamps/:id
//@access        Private
exports.deleteBootcamp = asyncHandler( async (req,res,next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);

        if (!bootcamp) {
            return next(new ErrorResponse(`The bootcamp od id ${req.params.id} is not found!`, 404));
        }
        await bootcamp.remove();

        res.status(200).json({
            success: true,
            data: bootcamp,
            message: "The bootcamp is deleted",
        });
});

//@describe      Get bootcamps by a given radius
//@route         GET /api/v1/bootcamps/radius/:zipcode/:distance  //distance in miles
//@access        Public
exports.getBootcampsInRadius = asyncHandler( async (req,res,next) => {
    const {zipcode, distance} = req.params;

    //let latitude and longitude from GeoCoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude, lng = loc[0].longitude;
    
    //calculate radius using radius (radius=distance/radius of Earth)
    //radius of earth = 3,963 miles or 6,378 km
    const radius = distance/3963;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] }
        }
    });
    
    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps 
    });
});

//@describe      Upload photo for a bootcamp
//@route         PUT /api/v1/bootcamps/:id/photo
//@access        Private
exports.bootcampPhotoUpload = asyncHandler( async (req,res,next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`The bootcamp od id ${req.params.id} is not found!`, 404));
    }
    
    //checking for file
    if(!req.files){
        return next( new ErrorResponse(`Please upload a file`,400));
    }
    
    const file = req.files.file;
    //checking for correct format
    if(!file.mimetype.startsWith('image')){
        return next( new ErrorResponse(`Please upload a Image file`,400));
    }
    
    //checking the size
    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next( new ErrorResponse(`Please upload the  Image file less than ${process.env.MAX_FILE_UPLOAD}`,400));
    }

    //create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err){
            console.error(err);
            return next( new ErrorResponse('Problem with file upload',500));
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, {
            photo: file.name,
        });
        res.status(200).json({
            success: true,
            data: file.name,
        });
    });
    
});