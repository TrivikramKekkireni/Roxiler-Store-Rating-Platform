const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

// 1. GET /api/admin/dashboard-stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings, roleCounts] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true,
        },
      }),
    ]);

    const formattedRoleCounts = {
      ADMIN: 0,
      NORMAL_USER: 0,
      STORE_OWNER: 0,
    };

    roleCounts.forEach((rc) => {
      formattedRoleCounts[rc.role] = rc._count.id;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStores,
        totalRatings,
        roleCounts: formattedRoleCounts,
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics.',
    });
  }
};

// 2. GET /api/admin/users (Search, Filter by Name/Email/Address/Role, Sort)
const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where = {};

    if (role && ['ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role.toUpperCase())) {
      where.role = role.toUpperCase();
    }

    if (name) {
      where.name = { contains: name };
    }

    if (email) {
      where.email = { contains: email };
    }

    if (address) {
      where.address = { contains: address };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const orderBy = {};
    const validSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
    orderBy[field] = order;

    const users = await prisma.user.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        managedStore: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: {
                rating: true,
              },
            },
          },
        },
      },
    });

    const formattedUsers = users.map((u) => {
      let storeRating = null;
      if (u.role === 'STORE_OWNER' && u.managedStore) {
        const ratings = u.managedStore.ratings || [];
        if (ratings.length > 0) {
          const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
          storeRating = parseFloat((sum / ratings.length).toFixed(2));
        } else {
          storeRating = 0;
        }
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        address: u.address,
        role: u.role,
        createdAt: u.createdAt,
        store: u.managedStore ? { id: u.managedStore.id, name: u.managedStore.name } : null,
        storeRating: storeRating,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedUsers.length,
      data: { users: formattedUsers },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.',
    });
  }
};

// 3. POST /api/admin/users (Create User: ADMIN, NORMAL_USER, STORE_OWNER)
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role = 'NORMAL_USER' } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        address,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: `User created successfully with role ${role}.`,
      data: { user },
    });
  } catch (error) {
    console.error('Error creating user by admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user.',
    });
  }
};

// 4. GET /api/admin/stores (Search, Filter, Sort, Overall Rating)
const getStores = async (req, res) => {
  try {
    const { name, email, address, search, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const where = {};

    if (name) {
      where.name = { contains: name };
    }
    if (email) {
      where.email = { contains: email };
    }
    if (address) {
      where.address = { contains: address };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const validSortFields = ['name', 'email', 'address', 'createdAt'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';
    const orderBy = { [field]: order };

    const stores = await prisma.store.findMany({
      where,
      orderBy,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    const formattedStores = stores.map((s) => {
      const ratings = s.ratings || [];
      const totalRatingsCount = ratings.length;
      let overallRating = 0;
      if (totalRatingsCount > 0) {
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        overallRating = parseFloat((sum / totalRatingsCount).toFixed(2));
      }

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        owner: s.owner,
        overallRating,
        totalRatingsCount,
        createdAt: s.createdAt,
      };
    });

    // If sorting by rating
    if (sortBy === 'rating') {
      formattedStores.sort((a, b) =>
        order === 'asc' ? a.overallRating - b.overallRating : b.overallRating - a.overallRating
      );
    }

    return res.status(200).json({
      success: true,
      count: formattedStores.length,
      data: { stores: formattedStores },
    });
  } catch (error) {
    console.error('Error fetching admin stores:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve stores list.',
    });
  }
};

// 5. POST /api/admin/stores (Create Store and Optionally Assign Owner)
const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const existingStore = await prisma.store.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingStore) {
      return res.status(409).json({
        success: false,
        message: 'A store with this email address already exists.',
      });
    }

    if (ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: parseInt(ownerId, 10) },
        include: { managedStore: true },
      });

      if (!owner) {
        return res.status(404).json({
          success: false,
          message: 'Specified owner user was not found.',
        });
      }

      if (owner.managedStore) {
        return res.status(400).json({
          success: false,
          message: 'The selected user is already managing another store.',
        });
      }

      // Upgrade role to STORE_OWNER if not already
      if (owner.role !== 'STORE_OWNER') {
        await prisma.user.update({
          where: { id: owner.id },
          data: { role: 'STORE_OWNER' },
        });
      }
    }

    const store = await prisma.store.create({
      data: {
        name,
        email: email.toLowerCase(),
        address,
        ownerId: ownerId ? parseInt(ownerId, 10) : null,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      data: { store },
    });
  } catch (error) {
    console.error('Error creating store:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create store.',
    });
  }
};

// 6. GET /api/admin/available-owners (List users who can be assigned as store owners)
const getAvailableOwners = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        managedStore: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    console.error('Error fetching available owners:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch available users.',
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  getStores,
  createStore,
  getAvailableOwners,
};
