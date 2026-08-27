const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/owner.controller');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

// Restrict all owner routes to authenticated STORE_OWNER
router.use(authenticate, authorizeRoles('STORE_OWNER'));

// GET /api/owner/dashboard
router.get('/dashboard', ownerController.getOwnerDashboard);

module.exports = router;
