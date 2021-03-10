const express = require('express');

const {getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius} = require('../controllers/bootcamps');

//include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

//Re-route into other resource router
router.use('/:bootcampId/courses', courseRouter); //this take us to './courses.js'


router.route('/').get(getBootcamps).post(createBootcamp);

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

module.exports = router;