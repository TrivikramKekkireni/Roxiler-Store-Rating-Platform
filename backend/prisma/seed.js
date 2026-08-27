const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing records in correct order
  await prisma.rating.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.user.deleteMany({});

  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const ownerPassword = await bcrypt.hash('Owner@12345', 10);
  const userPassword = await bcrypt.hash('User@12345', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Master',
      email: 'admin@roxiler.com',
      password: adminPassword,
      address: '100 Tech Enterprise Boulevard, Suite 500, Silicon Valley, CA 94025',
      role: 'ADMIN',
    },
  });

  // 2. Create Store Owners & Stores
  const owner1 = await prisma.user.create({
    data: {
      name: 'Store Owner Michael Scott',
      email: 'michael@dundermifflin.com',
      password: ownerPassword,
      address: '1725 Slough Avenue, Suite 200, Scranton, PA 18504',
      role: 'STORE_OWNER',
    },
  });

  const store1 = await prisma.store.create({
    data: {
      name: 'Dunder Mifflin Scranton Paper Co.',
      email: 'contact@dundermifflin.com',
      address: '1725 Slough Avenue, Suite 200, Scranton, PA 18504',
      ownerId: owner1.id,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Store Owner Eleanor Vance',
      email: 'eleanor@stellarbooks.com',
      password: ownerPassword,
      address: '450 Beacon Street, Back Bay, Boston, MA 02115',
      role: 'STORE_OWNER',
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Stellar Book Haven & Cafe',
      email: 'support@stellarbooks.com',
      address: '450 Beacon Street, Back Bay, Boston, MA 02115',
      ownerId: owner2.id,
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      name: 'Store Owner Marcus Rivera',
      email: 'marcus@gourmetbites.com',
      password: ownerPassword,
      address: '880 Mission Street, Downtown, San Francisco, CA 94103',
      role: 'STORE_OWNER',
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Gourmet Bites Artisan Market',
      email: 'hello@gourmetbites.com',
      address: '880 Mission Street, Downtown, San Francisco, CA 94103',
      ownerId: owner3.id,
    },
  });

  // 3. Create Normal Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Alice Robinson Henderson',
      email: 'alice@roxiler.com',
      password: userPassword,
      address: '123 Elmwood Avenue, Apartment 4B, Springfield, IL 62701',
      role: 'NORMAL_USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Benjamin Christopher Lee',
      email: 'benjamin@roxiler.com',
      password: userPassword,
      address: '789 Oakridge Drive, Austin, TX 78701',
      role: 'NORMAL_USER',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Catherine Sophia Taylor',
      email: 'catherine@roxiler.com',
      password: userPassword,
      address: '555 Pinecrest Lane, Seattle, WA 98101',
      role: 'NORMAL_USER',
    },
  });

  // 4. Create Initial Ratings
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store1.id, rating: 5 },
      { userId: user1.id, storeId: store2.id, rating: 4 },
      { userId: user1.id, storeId: store3.id, rating: 5 },
      { userId: user2.id, storeId: store1.id, rating: 4 },
      { userId: user2.id, storeId: store2.id, rating: 5 },
      { userId: user3.id, storeId: store3.id, rating: 4 },
    ],
  });

  console.log('✅ Seeding completed successfully!');
  console.log(`- Created Admin: ${admin.email}`);
  console.log(`- Created 3 Store Owners & Stores`);
  console.log(`- Created 3 Normal Users`);
  console.log(`- Created 6 Ratings`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
