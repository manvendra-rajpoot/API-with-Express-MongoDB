const express = require('express');

const { getReviews, getReview, addReview, updateReview, removeReview } = require('../controllers/reviews');

const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

const advancedSearch = require('../middlewares/advancedSearch');
const { protect, authorize } = require('../middlewares/auth');

router.route('/').get(advancedSearch(Review, {
    path: 'bootcamp',
    select: 'name description location.city',
}), getReviews).post(protect, authorize('admin','user'), addReview);

router.route('/:id').get(getReview).put(protect, authorize('admin','user'), updateReview).delete(protect, authorize('admin','user'), removeReview);


module.exports = router;