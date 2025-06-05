const express = require('express');
const router = express.Router();

const userController = require('./userController');
const isAdmin = require('../../middleware/isAdmin');
const authMiddleware = require('../../middleware/authMiddleware');

//user
router.patch('/register', userController.register); 
router.post('/login', userController.login);
router.get('/profile', authMiddleware, userController.getProfileById);
router.patch('/profile', authMiddleware, userController.editProfileById);
router.post('/forgot-password', userController.forgetPasswordOTP);
router.patch('/reset-password', userController.updateUserPassword);
router.patch('/change-password', authMiddleware, userController.updateUserPassword);
router.post('/verify-email', userController.verifyEmail);
router.post('/otp', userController.sendOtpToEmail); //resend

//admin
router.get('/', authMiddleware, isAdmin, userController.getUsersWithFilter);
router.patch('/', authMiddleware, isAdmin, userController.editUserById);


module.exports = router;    