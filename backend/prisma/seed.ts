import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  // Clear existing records
  await prisma.auditLog.deleteMany({});
  await prisma.verificationAttempt.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.user.deleteMany({});

  // Create mock seller
  const seller = await prisma.user.create({
    data: {
      id: 'seller-123',
      email: 'seller@example.com',
      name: 'Acme Corp Seller',
      role: 'SELLER',
    },
  });

  // Create mock admin
  const admin = await prisma.user.create({
    data: {
      id: 'admin-123',
      email: 'admin@example.com',
      name: 'Platform Admin',
      role: 'ADMIN',
    },
  });

  console.log('Database seeded!');
  console.log('Test Seller ID:', seller.id);
  console.log('Test Admin ID:', admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
