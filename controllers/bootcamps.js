const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');


//@describe      Get all bootcamps
//@route         GET /api/v1/bootcamps
//@access        Public
exports.getBootcamps = async (req, res, next) => {
    try {
        const bootcamps = await Bootcamp.find();
        res.status(200).json({
            success: true,
            count: bootcamps.length,
            data: bootcamps
        })
    } catch (err) {
        next(err);
    }
}

//@describe      Get a bootcamp
//@route         GET /api/v1/bootcamps/:id
//@access        Public
exports.getBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findById(req.params.id);

        if (!bootcamp) {
            return next(new ErrorResponse(`The bootcamp od id ${req.params.id} is not found!`, 404));
        }
        res.status(200).json({
            success: true,
            data: bootcamp
        });
    } catch (err) {
        next(err);
        // next(new ErrorResponse(`The bootcamp of ID: ${req.params.id} is not found!`, 404));
    }
}

//@describe      Craete a bootcamp
//@route         POST /api/v1/bootcamps
//@access        Private
exports.createBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({
            success: true,
            data: bootcamp
        });
    } catch (err) {
        next(err);
    }
}

//@describe      Update a bootcamp
//@route         PUT /api/v1/bootcamps/:id
//@access        Private
exports.updateBootcamp = async (req,res,next) => {
    try {
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
    } catch (err) {
        next(err);
    }
}

//@describe      Delete a bootcamp
//@route         DELETE /api/v1/bootcamps/:id
//@access        Private
exports.deleteBootcamp = async (req,res,next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

        if (!bootcamp) {
            return next(new ErrorResponse(`The bootcamp od id ${req.params.id} is not found!`, 404));
        }
        res.status(200).json({
            success: true,
            message: "Done"
        });
    } catch (err) {
        next(err);
    }
}