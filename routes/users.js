const express = require('express');
const { getUsers, getUser, addUser, updateUser, removeUser } = require('../controllers/users');
const User = require('../models/User')

const router = express.Router();

const advancedSearch = require('../middlewares/advancedSearch');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
router.use(authorize('admin'));

router.route('/').get(advancedSearch(User), getUsers).post(addUser);
router.route('/:id').get(getUser).put(updateUser).delete(removeUser);


module.exports = router;