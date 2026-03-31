import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.service.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@serviceflow.com',
      password: adminPassword,
      role: 'admin',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'manager@serviceflow.com',
      password: managerPassword,
      role: 'manager',
    },
  });
  console.log('✅ Manager user created:', manager.email);

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'user@serviceflow.com',
      password: userPassword,
      role: 'user',
    },
  });
  console.log('✅ Regular user created:', user.email);

  // Create sample clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Acme Corporation',
      email: 'contact@acme.com',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'TechVision Inc',
      email: 'hello@techvision.com',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Digital Solutions Ltd',
      email: 'info@digitalsolutions.com',
    },
  });

  console.log('✅ Sample clients created');

  // Create sample services
  await prisma.service.create({
    data: {
      clientId: client1.id,
      title: 'Website Development',
      description: 'Build a modern responsive website',
      value: 5000,
      status: 'completed',
    },
  });

  await prisma.service.create({
    data: {
      clientId: client1.id,
      title: 'SEO Optimization',
      description: 'Improve search engine rankings',
      value: 2000,
      status: 'in_progress',
    },
  });

  await prisma.service.create({
    data: {
      clientId: client2.id,
      title: 'Mobile App Development',
      description: 'Build iOS and Android apps',
      value: 15000,
      status: 'pending',
    },
  });

  await prisma.service.create({
    data: {
      clientId: client3.id,
      title: 'Cloud Migration',
      description: 'Migrate infrastructure to cloud',
      value: 8000,
      status: 'in_progress',
    },
  });

  console.log('✅ Sample services created');
  console.log('🌱 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
