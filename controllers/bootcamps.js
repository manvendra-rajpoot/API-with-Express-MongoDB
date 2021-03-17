const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const path = require('path');


//@describe      Get all bootcamps
//@route         GET /api/v1/bootcamps
//@access        Public
exports.getBootcamps = asyncHandler( async (req, res, next) => {
    res.status(200).json(res.advancedSearch); 
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
            data: {},
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