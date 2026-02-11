const express = require('express');
const router = express.Router();
const { loginUser, registerUser, updateProfile, changePassword, requestPasswordReset, resetPassword } = require('../controllers/authController');
const { loginValidation, registerValidation } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginValidation, loginUser);
router.post('/register', registerValidation, registerUser);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
