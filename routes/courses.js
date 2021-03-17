const express = require('express');

const { getCourses, getCourse, createCourse, updateCourse, deleteCourse } = require('../controllers/courses');

const Course = require('../models/Course');
const advancedSearch = require('../middlewares/advancedSearch');

const router = express.Router({ mergeParams:true });

const { protect, authorize } = require('../middlewares/auth');

router.route('/').get(advancedSearch(Course, {
    path: 'bootcamp',
    select: 'name description',
}), getCourses).post(protect, authorize('admin','publisher'), createCourse);

router.route('/:id').get(getCourse).put(protect, authorize('admin','publisher'), updateCourse).delete(protect, authorize('admin','publisher'), deleteCourse);


module.exports = router;