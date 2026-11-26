import { prisma } from '../config/db.js';
import fs from 'fs';

async function refreshSeed() {
  const allProductsPath = 'C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\6f75f533-2ded-4f0e-8187-4b4787e47e81\\scratch\\all_products.json';
  const products = JSON.parse(fs.readFileSync(allProductsPath, 'utf8'));

  console.log('Clearing old products table...');
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.stockReservation.deleteMany({});
  await prisma.productReview.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.product.deleteMany({});

  console.log(`Inserting ${products.length} fresh products...`);
  for (const p of products) {
    await prisma.product.create({
      data: {
        id: p.id,
        name: p.name,
        category: p.category,
        priceInr: p.priceInr,
        imageUrl: p.imageUrl,
        isAvailable: p.isAvailable,
        stockQuantity: p.stockQuantity,
        specDescription: p.specDescription,
        compatibilityNotes: p.compatibilityNotes,
        rating: 5.0
      }
    });
  }

  const count = await prisma.product.count();
  console.log(`Database refreshed with ${count} real products!`);
  await prisma.$disconnect();
}

refreshSeed().catch(err => {
  console.error(err);
  process.exit(1);
});
