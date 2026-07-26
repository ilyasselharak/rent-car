const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const adminPassword = await hash('SuperAdmin123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@rentcar.com' },
    update: {},
    create: {
      email: 'admin@rentcar.com',
      name: 'Super Administrator',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
      phone: '+1-555-0000',
    },
  });

  console.log('✅ Admin user created: admin@rentcar.com / SuperAdmin123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
