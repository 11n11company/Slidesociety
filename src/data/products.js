// Slidescoiety Product Catalog & Configurator Data

export const categories = [
  'All',
  'Cockpit frames',
  'Racing seats',
  'Wheel bases',
  'Pedals',
  'Shifters',
  'Handbrakes',
  'Monitor mounts',
  'Keyboard trays',
  'Cable-management kits',
  'Motion systems',
  'Bundles'
];

export const products = [];

export const stages = [
  {
    name: 'Cockpit Frame',
    category: 'Cockpit frames',
    help: 'Select the chassis foundation. Rigid extrusion ensures zero flex under extreme braking and high-torque direct drive forces.',
    ids: [],
    multi: false
  },
  {
    name: 'Racing Seat',
    category: 'Racing seats',
    help: 'Choose an ergonomic racing bucket seat that translates tactile force feedback directly to your body.',
    ids: [],
    multi: false
  },
  {
    name: 'Wheelbase',
    category: 'Wheel bases',
    help: 'Select your direct-drive wheelbase. Direct drive delivers instant force feedback with true 1:1 motorsport torque.',
    ids: [],
    multi: false
  },
  {
    name: 'Pedals',
    category: 'Pedals',
    help: 'Configure your pedal set. High-pressure load cells and hydraulic damping are vital for muscle memory under hard braking.',
    ids: [],
    multi: false
  },
  {
    name: 'Shifter & Handbrake',
    categories: ['Shifters', 'Handbrakes'],
    help: 'Add tactile sequential shifting and progressive analog handbrake controls for GT, rally, and drift racing.',
    ids: [],
    multi: true
  },
  {
    name: 'Mounts & Finish',
    categories: ['Monitor mounts', 'Keyboard trays', 'Cable-management kits', 'Motion systems'],
    help: 'Finish your rig with integrated display mounts, articulated keyboard trays, and cable routing kits.',
    ids: [],
    multi: true
  },
  {
    name: 'Review & Complete',
    help: 'Review your configured custom cockpit, verify estimated total, and export your build specifications.',
    ids: []
  }
];

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
      : (typeof item.price === 'number' ? item.price : existing.price || 0);

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
    : (typeof item.price === 'number' ? item.price : existing.price || 0);

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

