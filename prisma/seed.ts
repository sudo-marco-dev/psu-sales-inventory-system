import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  const clerkPassword = await bcrypt.hash('clerk123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      fullName: 'Admin User',
      role: 'ADMIN',
    },
  });

  const cashier = await prisma.user.upsert({
    where: { username: 'cashier' },
    update: {},
    create: {
      username: 'cashier',
      password: cashierPassword,
      fullName: 'Cashier User',
      role: 'CASHIER',
    },
  });

  const clerk = await prisma.user.upsert({
    where: { username: 'clerk' },
    update: {},
    create: {
      username: 'clerk',
      password: clerkPassword,
      fullName: 'Inventory Clerk',
      role: 'INVENTORY_CLERK',
    },
  });

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: {
      name: 'Electronics',
      description: 'Electronic devices and accessories',
    },
  });

  const stationery = await prisma.category.upsert({
    where: { name: 'Stationery' },
    update: {},
    create: {
      name: 'Stationery',
      description: 'Office and school supplies',
    },
  });

  // Create supplier
  const supplier = await prisma.supplier.upsert({
    where: { id: 'supplier-1' },
    update: {},
    create: {
      id: 'supplier-1',
      companyName: 'Tech Supplies Inc.',
      contactPerson: 'John Doe',
      phone: '+63 917 123 4567',
      email: 'john@techsupplies.com',
      address: 'Puerto Princesa City, Palawan',
    },
  });

  // Create products
  const products = [];
  for (let i = 1; i <= 50; i++) {
    const category = i % 2 === 0 ? electronics : stationery;
    products.push({
      code: `PROD-${i.toString().padStart(3, '0')}`,
      name: `Product ${i}`,
      description: `Description for product ${i}`,
      categoryId: category.id,
      supplierId: supplier.id,
      unitPrice: Math.floor(Math.random() * 1000) + 50,
      stockLevel: Math.floor(Math.random() * 200) + 50,
      reorderLevel: Math.floor(Math.random() * 20) + 10,
    });
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { code: product.code },
      update: {},
      create: product,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n👤 Default Users:');
  console.log('   Admin: username=admin, password=admin123');
  console.log('   Cashier: username=cashier, password=cashier123');
  console.log('   Clerk: username=clerk, password=clerk123');
  console.log('\n📦 Created:');
  console.log('   - 3 users');
  console.log('   - 2 categories');
  console.log('   - 1 supplier');
  console.log('   - 50 products');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });