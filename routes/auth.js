const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword, updateDetails, changePassword, logout } = require('../controllers/auth');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/me').get(protect ,getMe);
router.route('/logout').get(logout);
router.route('/updatedetails').put(protect ,updateDetails);
router.route('/changepassword').put(protect ,changePassword);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:resettoken').put(resetPassword);


module.exports = router;