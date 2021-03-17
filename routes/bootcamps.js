const express = require('express');

const {getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius, bootcampPhotoUpload} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp')
const advancedSearch = require('../middlewares/advancedSearch');

//include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

//Re-route into other resource router
router.use('/:bootcampId/courses', courseRouter); //this take us to './courses.js'

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

router.route('/:id/photo').put(bootcampPhotoUpload);

router.route('/').get(advancedSearch(Bootcamp, 'courses'), getBootcamps).post(createBootcamp);


module.exports = router;