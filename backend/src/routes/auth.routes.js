const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth');
const {
  signupValidation,
  loginValidation,
  updatePasswordValidation,
} = require('../middleware/validator');

// POST /api/auth/signup - Normal user registration
router.post('/signup', signupValidation, authController.signup);

// POST /api/auth/login - Single login for all roles
router.post('/login', loginValidation, authController.login);

// GET /api/auth/me - Current user profile
router.get('/me', authenticate, authController.getMe);

// PATCH /api/auth/update-password - Authenticated user password update
router.patch('/update-password', authenticate, updatePasswordValidation, authController.updatePassword);

module.exports = router;
