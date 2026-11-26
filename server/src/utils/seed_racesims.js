import { prisma } from '../config/db.js';
import fs from 'fs';

async function seed() {
  const html = fs.readFileSync('C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\6f75f533-2ded-4f0e-8187-4b4787e47e81\\scratch\\racesims.html', 'utf8');
  const groups = html.split(/<div class="rsc__group"/g).slice(1);

  const sectionMetadata = [
    { num: '01', id: 'wheelbase', title: 'Wheelbase', status: 'REQUIRED', hint: 'The motor that drives your wheel. More Nm = stronger, more detailed force feedback.', multi: false, hasSkip: false },
    { num: '02', id: 'steering-wheel', title: 'Steering Wheel', status: 'PICK ONE OR MORE', hint: 'Pick one or more rims — GT for endurance, formula for open-wheel. We auto-add a matching quick release for every Conspit rim.', multi: true, hasSkip: false },
    { num: '03', id: 'pedals', title: 'Pedals', status: 'REQUIRED', hint: 'Load cell = consistent braking. Hydraulic = maximum realism. Choose 2 or 3 pedals on the card.', multi: false, hasSkip: false },
    { num: '04', id: 'cockpit', title: 'Cockpit', status: 'REQUIRED', hint: 'Aluminium profile rigs — zero flex under direct drive load.', multi: false, hasSkip: false },
    { num: '05', id: 'motion-system', title: 'Motion System', status: 'OPTIONAL', hint: 'Add real motion — feel pitch, roll and heave under braking, cornering and kerbs. Pairs with your cockpit for the closest thing to the real car.', multi: false, hasSkip: true },
    { num: '06', id: 'monitor-stand', title: 'Monitor Stand', status: 'OPTIONAL', hint: 'Standalone or integrated — pairs with your cockpit and screen setup.', multi: false, hasSkip: true },
    { num: '07', id: 'seat', title: 'Seat', status: 'OPTIONAL', hint: 'Skip if your cockpit choice already includes a seat.', multi: false, hasSkip: true },
    { num: '08', id: 'shifter', title: 'Shifter', status: 'OPTIONAL', hint: 'H-pattern or sequential — for manual, rally and historic racing.', multi: false, hasSkip: true },
    { num: '09', id: 'handbrake', title: 'Handbrake', status: 'OPTIONAL', hint: 'Hydraulic or load cell — essential for rally and drift.', multi: false, hasSkip: true },
    { num: '10', id: 'monitor', title: 'Monitor', status: 'OPTIONAL', hint: 'Single ultrawide or triples — ask us about mounting.', multi: false, hasSkip: true },
    { num: '11', id: 'sim-pc', title: 'Sim PC', status: 'OPTIONAL', hint: "Spec'd for triple-screen iRacing and ACC.", multi: false, hasSkip: true },
    { num: '12', id: 'accessories', title: 'Accessories', status: 'OPTIONAL', hint: 'Pick as many as you need — mounts, trays, castor wheels and more.', multi: true, hasSkip: false }
  ];

  const productsToInsert = [];

  groups.forEach((g, idx) => {
    const meta = sectionMetadata[idx] || {
      num: String(idx + 1).padStart(2, '0'),
      id: `section-${idx + 1}`,
      title: `Section ${idx + 1}`,
      status: 'OPTIONAL',
      hint: '',
      multi: false,
      hasSkip: false
    };

    const cards = g.split(/<label class="rsc__card|<div class="rsc__card/g).slice(1);

    cards.forEach(c => {
      if (c.includes('rsc__card--skip')) return;

      const nameMatch = c.match(/class="rsc__pname"[^>]*>([\s\S]*?)<\/span>/i);
      const name = nameMatch ? nameMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      if (!name) return;

      // Extract price from span or data-price
      let priceInr = 0;
      const dataPriceMatch = c.match(/data-price="(\d+)"/i);
      if (dataPriceMatch && parseInt(dataPriceMatch[1], 10) > 0) {
        priceInr = parseInt(dataPriceMatch[1], 10) / 100;
      }
      if (!priceInr) {
        const textPriceMatch = c.match(/Rs\.\s*([\d,]+(?:\.\d{2})?)/i);
        if (textPriceMatch) {
          priceInr = parseFloat(textPriceMatch[1].replace(/,/g, ''));
        }
      }

      const imgMatch = c.match(/<img[^>]*src="([^"]+)"/i);
      let img = imgMatch ? imgMatch[1] : '/hero-backdrop-hd.jpg';
      if (img.startsWith('//')) img = 'https:' + img;

      const oos = c.includes('rsc__card--oos') || c.includes('OUT OF STOCK');

      const handleMatch = c.match(/data-handle="([^"]+)"/i);
      const id = (handleMatch ? handleMatch[1] : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).substring(0, 50);

      productsToInsert.push({
        id,
        name,
        category: meta.title,
        priceInr,
        imageUrl: img,
        isAvailable: !oos,
        stockQuantity: oos ? 0 : 30,
        specDescription: `${meta.title} engineered for ultra-rigid professional sim racing.`,
        compatibilityNotes: 'Verified 100% Direct Drive & Aluminium Profile Compatible.'
      });
    });
  });

  console.log(`Clearing old test items and seeding ${productsToInsert.length} products...`);

  await prisma.orderItem.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.productReview.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.stockReservation.deleteMany({});
  await prisma.product.deleteMany({});

  for (const p of productsToInsert) {
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

  console.log(`Successfully seeded all ${productsToInsert.length} products into PostgreSQL!`);
  await prisma.$disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
