const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const authenticate = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');
const { submitRatingValidation } = require('../middleware/validator');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

// Optional auth middleware for GET /api/stores so logged-in users get their own submitted rating
const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'roxiler_super_secret_jwt_key_2026_dev_secure');
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true, email: true },
      });
      if (user) {
        req.user = user;
      }
    } catch (e) {
      // Ignore token error for public view
    }
  }
  next();
};

// GET /api/stores - List stores with search and rating metrics
router.get('/', optionalAuthenticate, storeController.getStores);

// POST /api/stores/:storeId/rate - Submit or modify a rating (Normal Users only)
router.post(
  '/:storeId/rate',
  authenticate,
  authorizeRoles('NORMAL_USER'),
  submitRatingValidation,
  storeController.rateStore
);

module.exports = router;
