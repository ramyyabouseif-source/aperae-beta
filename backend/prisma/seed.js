/**
 * Prisma Seed Script
 * Seeds the database with initial data (optional)
 * Run with: npm run prisma:seed
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Example: Create a test user (optional - remove for production)
  // const testUser = await prisma.user.create({
  //   data: {
  //     email: 'test@example.com',
  //     passwordHash: '$2b$12$...', // Pre-hashed password
  //   },
  // });
  // console.log('Created test user:', testUser);
  
  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

