const express = require('express');

const { getCourses, getCourse, createCourse, updateCourse, deleteCourse } = require('../controllers/courses');

const Course = require('../models/Course');
const advancedSearch = require('../middlewares/advancedSearch');

const router = express.Router({ mergeParams:true });

router.route('/').get(advancedSearch(Course, {
    path: 'bootcamp',
    select: 'name description',
}), getCourses).post(createCourse);
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);


module.exports = router;