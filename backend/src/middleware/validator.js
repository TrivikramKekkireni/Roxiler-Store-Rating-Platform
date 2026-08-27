const { body, query, validationResult } = require('express-validator');

// Middleware to check validation results and format error messages
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: formattedErrors[0]?.message || 'Validation failed.',
      errors: formattedErrors,
    });
  }
  next();
};

// Password validator helper
const passwordValidationRule = (fieldName = 'password') => {
  return body(fieldName)
    .isString()
    .withMessage(`${fieldName} must be a string.`)
    .isLength({ min: 8, max: 16 })
    .withMessage(`${fieldName} must be between 8 and 16 characters long.`)
    .matches(/[A-Z]/)
    .withMessage(`${fieldName} must contain at least 1 uppercase letter (A-Z).`)
    .matches(/[!@#$%^&*]/)
    .withMessage(`${fieldName} must contain at least 1 special character (!@#$%^&*).`);
};

// 1. Validation for User Signup (Normal User)
const signupValidation = [
  body('name')
    .trim()
    .isString()
    .withMessage('Name must be a valid string.')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters long.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  passwordValidationRule('password'),
  body('address')
    .trim()
    .isString()
    .withMessage('Address must be a string.')
    .isLength({ min: 1, max: 400 })
    .withMessage('Address must not exceed 400 characters.'),
  handleValidationErrors,
];

// 2. Validation for Admin Creating User
const adminCreateUserValidation = [
  body('name')
    .trim()
    .isString()
    .withMessage('Name must be a valid string.')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters long.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  passwordValidationRule('password'),
  body('address')
    .trim()
    .isString()
    .withMessage('Address must be a string.')
    .isLength({ min: 1, max: 400 })
    .withMessage('Address must not exceed 400 characters.'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'NORMAL_USER', 'STORE_OWNER'])
    .withMessage('Role must be ADMIN, NORMAL_USER, or STORE_OWNER.'),
  handleValidationErrors,
];

// 3. Validation for Admin Creating Store
const adminCreateStoreValidation = [
  body('name')
    .trim()
    .isString()
    .withMessage('Store name is required.')
    .isLength({ min: 3, max: 100 })
    .withMessage('Store name must be between 3 and 100 characters.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid store email address.')
    .normalizeEmail(),
  body('address')
    .trim()
    .isString()
    .withMessage('Address is required.')
    .isLength({ min: 1, max: 400 })
    .withMessage('Address must not exceed 400 characters.'),
  body('ownerId')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Owner ID must be a valid integer user ID.'),
  handleValidationErrors,
];

// 4. Validation for Login
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
  handleValidationErrors,
];

// 5. Validation for Password Update
const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required.'),
  passwordValidationRule('newPassword'),
  handleValidationErrors,
];

// 6. Validation for Rating Submission
const submitRatingValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.'),
  handleValidationErrors,
];

module.exports = {
  signupValidation,
  adminCreateUserValidation,
  adminCreateStoreValidation,
  loginValidation,
  updatePasswordValidation,
  submitRatingValidation,
  handleValidationErrors,
};
