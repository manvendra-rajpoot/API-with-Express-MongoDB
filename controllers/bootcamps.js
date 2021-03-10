const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');


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
    let query = Bootcamp.find(JSON.parse(queryStr));

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
            return next(new ErrorResponse(`The bootcamp od id ${req.params.id} is not found!`, 404));
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
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

        if (!bootcamp) {
            return next(new ErrorResponse(`The bootcamp od id ${req.params.id} is not found!`, 404));
        }
        res.status(200).json({
            success: true,
            message: "Done"
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