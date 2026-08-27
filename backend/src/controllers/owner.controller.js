const prisma = require('../config/prisma');

// 1. GET /api/owner/dashboard (Get store metrics and customer rating list for store owner)
const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const store = await prisma.store.findUnique({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                address: true,
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'No store is currently assigned to your store owner account.',
      });
    }

    const ratingsList = store.ratings || [];
    const totalReviews = ratingsList.length;

    let averageRating = 0;
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (totalReviews > 0) {
      const sum = ratingsList.reduce((acc, r) => {
        if (ratingDistribution[r.rating] !== undefined) {
          ratingDistribution[r.rating] += 1;
        }
        return acc + r.rating;
      }, 0);
      averageRating = parseFloat((sum / totalReviews).toFixed(2));
    }

    const customerRatings = ratingsList.map((r) => ({
      id: r.id,
      rating: r.rating,
      user: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        address: r.user.address,
      },
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      data: {
        store: {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          createdAt: store.createdAt,
        },
        metrics: {
          averageRating,
          totalReviews,
          ratingDistribution,
        },
        customerRatings,
      },
    });
  } catch (error) {
    console.error('Error fetching owner dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve store owner dashboard.',
    });
  }
};

module.exports = {
  getOwnerDashboard,
};
