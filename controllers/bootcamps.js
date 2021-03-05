//@describe      Get all bootcamps
//@route         GET /api/v1/bootcamps
//@access        Public
exports.getBootcamps = (req,res,next) => {
    res.status(200).json({success: true, message:'Show all bootcmaps'});
}

//@describe      Get a bootcamp
//@route         GET /api/v1/bootcamps/:id
//@access        Public
exports.getBootcamp = (req,res,next) => {
    res.status(200).json({success: true, message:`Dispaly bootcamp-${req.params.id}`});
}

//@describe      Craete a bootcamp
//@route         POST /api/v1/bootcamps
//@access        Private
exports.createBootcamp = (req,res,next) => {
    res.status(201).json({success: true, message:'Created a bootcmap'});
}

//@describe      Update a bootcamp
//@route         PUT /api/v1/bootcamps/:id
//@access        Private
exports.updateBootcamp = (req,res,next) => {
    res.status(200).json({success: true, message:`Updated bootcamp-${req.params.id}`});
}

//@describe      Delete a bootcamp
//@route         DELETE /api/v1/bootcamps/:id
//@access        Private
exports.deleteBootcamp = (req,res,next) => {
    res.status(200).json({success: true, message:`Deleted bootcmap-${req.params.id}`});
}