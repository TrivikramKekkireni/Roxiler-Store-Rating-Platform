const prisma = require('../config/prisma');

// 1. GET /api/stores (List stores for users with search by name/address and user rating)
const getStores = async (req, res) => {
  try {
    const { search, name, address, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const userId = req.user ? req.user.id : null;

    const where = {};

    if (name) {
      where.name = { contains: name };
    }

    if (address) {
      where.address = { contains: address };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        ratings: {
          select: {
            id: true,
            rating: true,
            userId: true,
          },
        },
      },
      orderBy: sortBy === 'name' ? { name: sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc' } : { createdAt: 'desc' },
    });

    const formattedStores = stores.map((s) => {
      const allRatings = s.ratings || [];
      const count = allRatings.length;
      let overallRating = 0;
      if (count > 0) {
        const sum = allRatings.reduce((acc, r) => acc + r.rating, 0);
        overallRating = parseFloat((sum / count).toFixed(2));
      }

      let userRating = null;
      let userRatingId = null;
      if (userId) {
        const found = allRatings.find((r) => r.userId === userId);
        if (found) {
          userRating = found.rating;
          userRatingId = found.id;
        }
      }

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        overallRating,
        totalRatingsCount: count,
        userRating,
        userRatingId,
        createdAt: s.createdAt,
      };
    });

    if (sortBy === 'rating') {
      formattedStores.sort((a, b) =>
        sortOrder.toLowerCase() === 'asc' ? a.overallRating - b.overallRating : b.overallRating - a.overallRating
      );
    }

    return res.status(200).json({
      success: true,
      count: formattedStores.length,
      data: { stores: formattedStores },
    });
  } catch (error) {
    console.error('Error fetching stores for user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve stores.',
    });
  }
};

// 2. POST /api/stores/:storeId/rate (Submit or modify rating)
const rateStore = async (req, res) => {
  try {
    const storeId = parseInt(req.params.storeId, 10);
    const userId = req.user.id;
    const { rating } = req.body;

    if (isNaN(storeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid store ID provided.',
      });
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      });
    }

    // Upsert rating (if user already rated, modify it; otherwise create)
    const ratingRecord = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      update: {
        rating: parseInt(rating, 10),
      },
      create: {
        userId,
        storeId,
        rating: parseInt(rating, 10),
      },
    });

    // Compute updated store average
    const storeRatings = await prisma.rating.findMany({
      where: { storeId },
      select: { rating: true },
    });

    const totalRatings = storeRatings.length;
    const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0);
    const overallRating = parseFloat((sum / totalRatings).toFixed(2));

    return res.status(200).json({
      success: true,
      message: 'Rating submitted successfully.',
      data: {
        rating: ratingRecord.rating,
        overallRating,
        totalRatings,
      },
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit rating.',
    });
  }
};

module.exports = {
  getStores,
  rateStore,
};
