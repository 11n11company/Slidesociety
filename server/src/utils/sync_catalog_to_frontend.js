import { prisma } from '../config/db.js';
import fs from 'fs';

async function syncToFrontend() {
  const dbProducts = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Fetched ${dbProducts.length} products from PostgreSQL.`);

  // Clean html entities in names and images
  const cleanedProducts = dbProducts.map(p => {
    const cleanName = p.name
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    const cleanImg = p.imageUrl
      .replace(/&amp;/g, '&');

    const priceNum = Number(p.priceInr) || 0;

    return {
      id: p.id,
      name: cleanName,
      category: p.category,
      cat: p.category,
      price: priceNum,
      priceInr: priceNum,
      imageUrl: cleanImg,
      image: cleanImg,
      isAvailable: p.isAvailable,
      stockQuantity: p.stockQuantity,
      specDescription: p.specDescription || '',
      spec: p.specDescription || '',
      compatibilityNotes: p.compatibilityNotes || 'Verified 100% Direct Drive & Aluminium Profile Compatible.'
    };
  });

  // Update PostgreSQL with cleaned names
  for (const p of cleanedProducts) {
    await prisma.product.update({
      where: { id: p.id },
      data: {
        name: p.name,
        imageUrl: p.imageUrl
      }
    });
  }

  // Update src/data/products.js with the EXACT products from PostgreSQL
  const fileContent = `// Slidescoiety Product Catalog & Configurator Data

export const categories = [
  'All',
  'Wheelbase',
  'Steering Wheel',
  'Pedals',
  'Cockpit',
  'Motion System',
  'Monitor Stand',
  'Seat',
  'Shifter',
  'Handbrake',
  'Monitor',
  'Sim PC',
  'Accessories'
];

export const RIG_SECTIONS = [
  {
    num: '01',
    id: 'wheelbase',
    title: 'Wheelbase',
    categories: ['Wheelbase', 'Wheel bases'],
    status: 'REQUIRED',
    hint: 'The motor that drives your wheel. More Nm = stronger, more detailed force feedback.',
    multi: false,
    hasSkip: false
  },
  {
    num: '02',
    id: 'steering-wheel',
    title: 'Steering Wheel',
    categories: ['Steering Wheel', 'Steering wheels', 'Rims'],
    status: 'PICK ONE OR MORE',
    hint: 'Pick one or more rims — GT for endurance, formula for open-wheel. We auto-add a matching quick release for every Conspit rim.',
    multi: true,
    hasSkip: false
  },
  {
    num: '03',
    id: 'pedals',
    title: 'Pedals',
    categories: ['Pedals'],
    status: 'REQUIRED',
    hint: 'Load cell = consistent braking. Hydraulic = maximum realism. Choose 2 or 3 pedals on the card.',
    multi: false,
    hasSkip: false
  },
  {
    num: '04',
    id: 'cockpit',
    title: 'Cockpit',
    categories: ['Cockpit', 'Cockpit frames'],
    status: 'REQUIRED',
    hint: 'Aluminium profile rigs — zero flex under direct drive load.',
    multi: false,
    hasSkip: false
  },
  {
    num: '05',
    id: 'motion-system',
    title: 'Motion System',
    categories: ['Motion System', 'Motion systems'],
    status: 'OPTIONAL',
    hint: 'Add real motion — feel pitch, roll and heave under braking, cornering and kerbs. Pairs with your cockpit for the closest thing to the real car.',
    multi: false,
    hasSkip: true
  },
  {
    num: '06',
    id: 'monitor-stand',
    title: 'Monitor Stand',
    categories: ['Monitor Stand', 'Monitor mounts'],
    status: 'OPTIONAL',
    hint: 'Standalone or integrated — pairs with your cockpit and screen setup.',
    multi: false,
    hasSkip: true
  },
  {
    num: '07',
    id: 'seat',
    title: 'Seat',
    categories: ['Seat', 'Racing seats'],
    status: 'OPTIONAL',
    hint: 'Skip if your cockpit choice already includes a seat.',
    multi: false,
    hasSkip: true
  },
  {
    num: '08',
    id: 'shifter',
    title: 'Shifter',
    categories: ['Shifter', 'Shifters'],
    status: 'OPTIONAL',
    hint: 'H-pattern or sequential — for manual, rally and historic racing.',
    multi: false,
    hasSkip: true
  },
  {
    num: '09',
    id: 'handbrake',
    title: 'Handbrake',
    categories: ['Handbrake', 'Handbrakes'],
    status: 'OPTIONAL',
    hint: 'Hydraulic or load cell — essential for rally and drift.',
    multi: false,
    hasSkip: true
  },
  {
    num: '10',
    id: 'monitor',
    title: 'Monitor',
    categories: ['Monitor', 'Monitors'],
    status: 'OPTIONAL',
    hint: 'Single ultrawide or triples — ask us about mounting.',
    multi: false,
    hasSkip: true
  },
  {
    num: '11',
    id: 'sim-pc',
    title: 'Sim PC',
    categories: ['Sim PC', 'Gaming PC'],
    status: 'OPTIONAL',
    hint: "Spec'd for triple-screen iRacing and ACC.",
    multi: false,
    hasSkip: true
  },
  {
    num: '12',
    id: 'accessories',
    title: 'Accessories',
    categories: ['Accessories', 'Keyboard trays', 'Cable-management kits'],
    status: 'OPTIONAL',
    hint: 'Pick as many as you need — mounts, trays, castor wheels and more.',
    multi: true,
    hasSkip: false
  }
];

export const QUICK_PRESETS = [
  {
    id: 'starter-gt',
    name: 'STARTER GT',
    desc: 'ClubSport DD 8Nm with GT3 Rim & Load Cell Pedals on GT Chassis',
    productIds: [
      'conspit-ares-apex-8nm-cdr-qr-nrg-style-direct-driv',
      'fanatec-csl-steering-wheel-gt3',
      'conspit-cpp-apex-pedals-sim-racing-pedals',
      'racesims-gt-sim-cockpit'
    ]
  },
  {
    id: 'gt-pro',
    name: 'GT PRO',
    desc: 'High-Torque 12Nm Base with Pro Rim, Hydraulic Pedals & GT Rig',
    productIds: [
      'conspit-ares-12nm-holding-torque-direct-drive-sim-',
      'conspit-300gt',
      'conspit-cpp-lite-pedals-sim-racing-pedals',
      'racesims-gt-sim-cockpit'
    ]
  },
  {
    id: 'formula',
    name: 'FORMULA',
    desc: '20Nm Direct Drive, Formula Rim & Formula Inverted Seating Position',
    productIds: [
      'conspit-ares-platinum-20nm-holding-torque-direct-d',
      'conspit-290gp',
      'conspit-cpp-evo-v2-sim-racing-pedals',
      'conspit-fp-lite-formula-style-cockpit'
    ]
  },
  {
    id: 'rally',
    name: 'RALLY',
    desc: '12Nm DD with Round WRC Wheel, Load Cell, Dual Shifter & Rally Handbrake',
    productIds: [
      'conspit-ares-12nm-holding-torque-direct-drive-sim-',
      'conspit-h-oa-hub',
      'conspit-cpp-lite-pedals-sim-racing-pedals',
      'racesims-gt-sim-cockpit',
      'vnm-sequential-h-pattern-shifter-dual-mode',
      'conspit-h3-hydraulic-hand-brake'
    ]
  }
];

// Master products catalogue baseline (100% synchronized with PostgreSQL database)
export const products = ${JSON.stringify(cleanedProducts, null, 2)};

export const stages = RIG_SECTIONS.map(s => ({
  name: s.title,
  category: s.title,
  categories: s.categories,
  help: s.hint,
  multi: s.multi,
  hasSkip: s.hasSkip
}));

export const gallery = [];

export const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

// Dynamic in-memory live catalog initialized with baseline products
export const liveProductMap = new Map();

products.forEach((p) => {
  liveProductMap.set(p.id, { ...p });
});

/**
 * Hydrates or batch updates the live product catalog from database response.
 */
export function setLiveProducts(list) {
  if (!Array.isArray(list)) return;
  list.forEach((item) => {
    if (!item || !item.id) return;
    const existing = liveProductMap.get(item.id) || {};
    const priceNum = typeof item.priceInr === 'number'
      ? item.priceInr
      : (!isNaN(Number(item.priceInr)) ? Number(item.priceInr) : (typeof item.price === 'number' ? item.price : existing.price || 0));

    liveProductMap.set(item.id, {
      ...existing,
      ...item,
      image: item.imageUrl || item.image || existing.image || '/hero-backdrop-hd.jpg',
      imageUrl: item.imageUrl || item.image || existing.imageUrl || '/hero-backdrop-hd.jpg',
      price: priceNum,
      priceInr: priceNum,
      cat: item.category || item.cat || existing.cat || 'General',
      category: item.category || item.cat || existing.category || 'General',
      spec: item.specDescription || item.spec || existing.spec || '',
      specDescription: item.specDescription || item.spec || existing.specDescription || ''
    });
  });
}

/**
 * Synchronizes a single updated or newly created product into the live catalog.
 */
export function updateSingleLiveProduct(item) {
  if (!item || !item.id) return null;
  const existing = liveProductMap.get(item.id) || {};
  const priceNum = typeof item.priceInr === 'number'
    ? item.priceInr
    : (!isNaN(Number(item.priceInr)) ? Number(item.priceInr) : (typeof item.price === 'number' ? item.price : existing.price || 0));

  const updated = {
    ...existing,
    ...item,
    image: item.imageUrl || item.image || existing.image || '/hero-backdrop-hd.jpg',
    imageUrl: item.imageUrl || item.image || existing.imageUrl || '/hero-backdrop-hd.jpg',
    price: priceNum,
    priceInr: priceNum,
    cat: item.category || item.cat || existing.cat || 'General',
    category: item.category || item.cat || existing.category || 'General',
    spec: item.specDescription || item.spec || existing.spec || '',
    specDescription: item.specDescription || item.spec || existing.specDescription || ''
  };

  liveProductMap.set(item.id, updated);
  return updated;
}

/**
 * Returns all current live products as an array.
 */
export function getAllLiveProducts() {
  return Array.from(liveProductMap.values());
}

/**
 * Resolves a product by ID, checking the live dynamic registry first.
 */
export const byId = (id) => {
  if (!id) return null;
  return liveProductMap.get(id) || products.find((p) => p.id === id) || null;
};
`;

  fs.writeFileSync('c:\\Users\\LENOVO\\Downloads\\slidescoiety-localhost\\src\\data\\products.js', fileContent);
  console.log('Synchronized PostgreSQL catalog directly into src/data/products.js!');
  await prisma.$disconnect();
}

syncToFrontend().catch(console.error);
