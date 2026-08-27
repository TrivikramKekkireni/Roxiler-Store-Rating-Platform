const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');
const {
  adminCreateUserValidation,
  adminCreateStoreValidation,
} = require('../middleware/validator');

// Restrict all admin routes to users with role 'ADMIN'
router.use(authenticate, authorizeRoles('ADMIN'));

// GET /api/admin/dashboard-stats
router.get('/dashboard-stats', adminController.getDashboardStats);

// GET /api/admin/users
router.get('/users', adminController.getUsers);

// POST /api/admin/users
router.post('/users', adminCreateUserValidation, adminController.createUser);

// GET /api/admin/stores
router.get('/stores', adminController.getStores);

// POST /api/admin/stores
router.post('/stores', adminCreateStoreValidation, adminController.createStore);

// GET /api/admin/available-owners
router.get('/available-owners', adminController.getAvailableOwners);

module.exports = router;
