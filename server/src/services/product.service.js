import { prisma, getDatabaseStatus } from '../config/db.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

// Custom error for production database outage
class DatabaseUnavailableError extends Error {
  constructor(message = 'Database service is currently unavailable') {
    super(message);
    this.name = 'DatabaseUnavailableError';
    this.statusCode = 503;
    this.isOperational = true;
  }
}

// Curated master catalogue baseline synchronized with frontend src/data/products.js
export const FALLBACK_CATEGORIES = [
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

export const FALLBACK_PRODUCTS = [
  {
    id: 'frame-x',
    name: 'P1-X Apex Cockpit Frame',
    category: 'Cockpit frames',
    priceInr: 132450,
    priceEurDisplay: '1.487,45 €',
    specDescription: 'Zero-flex anodized aluminum extrusion chassis, Team Redline edition. Engineered for direct drive wheelbases up to 35Nm.',
    compatibilityNotes: 'Universal wheel & pedal deck pattern (Fanatec, Simucube, Heusinkveld, Asetek).',
    rating: 4.9,
    isAvailable: true,
    stockQuantity: 25,
    imageUrl: '/hero-backdrop-hd.jpg'
  },
  {
    id: 'frame-s',
    name: 'Vector S Compact Cockpit',
    category: 'Cockpit frames',
    priceInr: 34999,
    priceEurDisplay: '399,00 €',
    specDescription: 'Compact 8040 profile aluminum chassis designed for apartments and smaller driving spaces.',
    compatibilityNotes: 'Supports wheelbases up to 15Nm and standard load-cell pedals.',
    rating: 4.8,
    isAvailable: true,
    stockQuantity: 40,
    imageUrl: 'https://images.pexels.com/photos/13251222/pexels-photo-13251222.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'frame-p',
    name: 'Vector P Pro Cockpit',
    category: 'Cockpit frames',
    priceInr: 54999,
    priceEurDisplay: '649,00 €',
    specDescription: 'Heavy-duty 16040/8040 extrusion architecture with reinforced pedal deck gussets.',
    compatibilityNotes: 'High-torque direct drive bases up to 25Nm and heavy hydraulic pedals.',
    rating: 4.9,
    isAvailable: true,
    stockQuantity: 30,
    imageUrl: 'https://images.pexels.com/photos/36899773/pexels-photo-36899773.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'seat',
    name: 'GT Motorsport Bucket Seat',
    category: 'Racing seats',
    priceInr: 24999,
    priceEurDisplay: '289,00 €',
    specDescription: 'Ergonomic fiberglass shell with high-density foam padding and breathable fabric.',
    compatibilityNotes: 'Standard side-mounting brackets included. Fits all Vector & P1-X cockpits.',
    rating: 4.7,
    isAvailable: true,
    stockQuantity: 50,
    imageUrl: 'https://images.pexels.com/photos/18760172/pexels-photo-18760172.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'seat-lite',
    name: 'Apex Carbon Fiber Seat',
    category: 'Racing seats',
    priceInr: 42999,
    priceEurDisplay: '499,00 €',
    specDescription: 'Ultra-light carbon fiber composite shell with premium alcantara inserts and Slidescoiety stitching.',
    compatibilityNotes: 'Compatible with standard FIA side-mount brackets.',
    rating: 4.9,
    isAvailable: true,
    stockQuantity: 20,
    imageUrl: 'https://images.pexels.com/photos/21777020/pexels-photo-21777020.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'wheel',
    name: 'Direct Drive Pro Wheelbase 25Nm',
    category: 'Wheel bases',
    priceInr: 84999,
    priceEurDisplay: '989,00 €',
    specDescription: 'Industrial servo direct-drive motor with ultra-low latency, 25Nm peak torque, and active cooling.',
    compatibilityNotes: 'Front-mount and side-mount bracket compatible for zero chassis flex.',
    rating: 5.0,
    isAvailable: true,
    stockQuantity: 15,
    imageUrl: 'https://images.pexels.com/photos/28993123/pexels-photo-28993123.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'pedals',
    name: 'Hydraulic Load-Cell 3-Pedal Set',
    category: 'Pedals',
    priceInr: 48999,
    priceEurDisplay: '569,00 €',
    specDescription: 'CNC machined billet aluminum pedal set with 200kg load cell brake and hydraulic damping.',
    compatibilityNotes: 'Adjustable pedal face angles, travel stops, and spring stiffness.',
    rating: 4.9,
    isAvailable: true,
    stockQuantity: 35,
    imageUrl: 'https://images.pexels.com/photos/9787476/pexels-photo-9787476.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'pedals-pro',
    name: 'ActiveForce Haptic Pedal System',
    category: 'Pedals',
    priceInr: 89999,
    priceEurDisplay: '1.049,00 €',
    specDescription: 'Motorsport active haptic motors delivering live telemetry ABS pulses and traction feedback.',
    compatibilityNotes: 'Direct USB connection with automated game telemetry integration.',
    rating: 5.0,
    isAvailable: true,
    stockQuantity: 18,
    imageUrl: 'https://images.pexels.com/photos/9787475/pexels-photo-9787475.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'shifter',
    name: 'Sequential & H-Pattern Shifter',
    category: 'Shifters',
    priceInr: 18999,
    priceEurDisplay: '219,00 €',
    specDescription: 'Dual-mode selector mechanism with tactile mechanical gates and magnetic resistance.',
    compatibilityNotes: 'Direct profile mounting with included T-nuts.',
    rating: 4.8,
    isAvailable: true,
    stockQuantity: 45,
    imageUrl: 'https://images.pexels.com/photos/33878052/pexels-photo-33878052.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'handbrake',
    name: 'Progressive Hydraulic Handbrake',
    category: 'Handbrakes',
    priceInr: 13999,
    priceEurDisplay: '159,00 €',
    specDescription: 'Real hydraulic master cylinder with progressive polyurethane elastomer spring.',
    compatibilityNotes: 'Horizontal and vertical handle mounting configurations.',
    rating: 4.7,
    isAvailable: true,
    stockQuantity: 40,
    imageUrl: 'https://images.pexels.com/photos/28920609/pexels-photo-28920609.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'display',
    name: 'Integrated Triple Monitor Mount',
    category: 'Monitor mounts',
    priceInr: 22999,
    priceEurDisplay: '269,00 €',
    specDescription: 'Heavy-duty 4080 extrusion crossbar and pivot arms supporting triple 27" to 43" screens.',
    compatibilityNotes: 'VESA 75/100/200 compatible micro-adjustment plates.',
    rating: 4.9,
    isAvailable: true,
    stockQuantity: 28,
    imageUrl: 'https://images.pexels.com/photos/28534969/pexels-photo-28534969.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'tray',
    name: 'Articulated Keyboard & Mouse Tray',
    category: 'Keyboard trays',
    priceInr: 7499,
    priceEurDisplay: '89,00 €',
    specDescription: 'Swivel arm aluminum tray with non-slip neoprene surface for racing telemetry keyboards.',
    compatibilityNotes: 'Attaches to any standard 40mm/80mm profile groove.',
    rating: 4.6,
    isAvailable: true,
    stockQuantity: 60,
    imageUrl: 'https://images.pexels.com/photos/15372896/pexels-photo-15372896.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'cable',
    name: 'Motorsport Cable Management Kit',
    category: 'Cable-management kits',
    priceInr: 3499,
    priceEurDisplay: '39,00 €',
    specDescription: 'Push-in cable clips, braided sleeving, and profile slot covers for a clean race-ready cockpit.',
    compatibilityNotes: 'Fits all Series 40 extrusion slots.',
    rating: 4.8,
    isAvailable: true,
    stockQuantity: 100,
    imageUrl: 'https://images.pexels.com/photos/20213730/pexels-photo-20213730.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'motion',
    name: 'Quad-Actuator 4DOF Motion System',
    category: 'Motion systems',
    priceInr: 245000,
    priceEurDisplay: '2.890,00 €',
    specDescription: 'High-speed linear actuators providing pitch, roll, heave, and surge with millisecond latency.',
    compatibilityNotes: 'Requires reinforced P1-X or Vector P chassis with professional floor anchoring.',
    rating: 5.0,
    isAvailable: false,
    stockQuantity: 0,
    imageUrl: 'https://images.pexels.com/photos/6498307/pexels-photo-6498307.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'bundle-s',
    name: 'Vector S ClubSport Starter Bundle',
    category: 'Bundles',
    priceInr: 98999,
    priceEurDisplay: '1.149,00 €',
    specDescription: 'Complete package: Vector S chassis, GT Bucket Seat, and Load-Cell 3-pedal set.',
    compatibilityNotes: 'Everything needed to mount your steering wheel and start driving.',
    rating: 4.9,
    isAvailable: true,
    stockQuantity: 12,
    imageUrl: 'https://images.pexels.com/photos/28993110/pexels-photo-28993110.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'bundle-p',
    name: 'P1-X Pro Apex Championship Bundle',
    category: 'Bundles',
    priceInr: 224999,
    priceEurDisplay: '2.599,00 €',
    specDescription: 'Flagship bundle: P1-X Team Redline chassis, Carbon Seat, Direct Drive 25Nm, and Triple Monitor Mount.',
    compatibilityNotes: 'Turn-key championship grade setup for serious sim racers.',
    rating: 5.0,
    isAvailable: true,
    stockQuantity: 8,
    imageUrl: 'https://images.pexels.com/photos/28993109/pexels-photo-28993109.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

export async function getAllProducts({
  category,
  search,
  minPrice,
  maxPrice,
  sortBy,
  page,
  limit
} = {}) {
  const cleanCategory = typeof category === 'string' ? category.trim() : '';
  const cleanSearch = typeof search === 'string' ? search.trim() : '';
  const parsedMin = minPrice !== undefined && minPrice !== '' && !isNaN(Number(minPrice)) ? parseFloat(minPrice) : null;
  const parsedMax = maxPrice !== undefined && maxPrice !== '' && !isNaN(Number(maxPrice)) ? parseFloat(maxPrice) : null;
  const isPaginated = page !== undefined || limit !== undefined;
  const p = page ? Math.max(1, parseInt(page, 10)) : 1;
  const l = limit ? Math.max(1, Math.min(100, parseInt(limit, 10))) : 16;
  const sortKey = typeof sortBy === 'string' ? sortBy.toLowerCase().trim() : 'featured';

  if (getDatabaseStatus() && prisma) {
    try {
      const where = {};

      if (cleanCategory && cleanCategory.toLowerCase() !== 'all') {
        const catLower = cleanCategory.toLowerCase();
        if (catLower === 'accessories' || catLower === 'mounts & adjustments') {
          where.category = { in: ['Monitor mounts', 'Keyboard trays', 'Cable-management kits'] };
        } else {
          where.category = { equals: cleanCategory, mode: 'insensitive' };
        }
      }

      if (cleanSearch) {
        where.OR = [
          { name: { contains: cleanSearch, mode: 'insensitive' } },
          { specDescription: { contains: cleanSearch, mode: 'insensitive' } },
          { category: { contains: cleanSearch, mode: 'insensitive' } }
        ];
      }

      if (parsedMin !== null || parsedMax !== null) {
        where.priceInr = {};
        if (parsedMin !== null) where.priceInr.gte = parsedMin;
        if (parsedMax !== null) where.priceInr.lte = parsedMax;
      }

      let orderBy = [{ createdAt: 'asc' }, { id: 'asc' }]; // default: featured starting grid order
      if (sortKey === 'price_asc' || sortKey === 'low' || sortKey === 'price_low') {
        orderBy = [{ priceInr: 'asc' }, { id: 'asc' }];
      } else if (sortKey === 'price_desc' || sortKey === 'high' || sortKey === 'price_high') {
        orderBy = [{ priceInr: 'desc' }, { id: 'asc' }];
      } else if (sortKey === 'newest' || sortKey === 'new') {
        orderBy = [{ createdAt: 'desc' }, { id: 'asc' }];
      } else if (sortKey === 'rating') {
        orderBy = [{ rating: 'desc' }, { priceInr: 'desc' }];
      } else if (sortKey === 'featured' || sortKey === 'default') {
        orderBy = [{ createdAt: 'asc' }, { id: 'asc' }];
      }

      const select = {
        id: true,
        name: true,
        category: true,
        priceInr: true,
        priceEurDisplay: true,
        specDescription: true,
        compatibilityNotes: true,
        rating: true,
        isAvailable: true,
        stockQuantity: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true
      };

      if (isPaginated) {
        const totalCount = await prisma.product.count({ where });
        const dbProducts = await prisma.product.findMany({
          where,
          orderBy,
          skip: (p - 1) * l,
          take: l,
          select
        });

        return {
          products: dbProducts,
          totalCount,
          pagination: {
            page: p,
            limit: l,
            totalCount,
            totalPages: Math.ceil(totalCount / l) || 1
          }
        };
      }

      const dbProducts = await prisma.product.findMany({ where, orderBy, select });
      return {
        products: dbProducts,
        totalCount: dbProducts.length
      };
    } catch (err) {
      if (env.NODE_ENV === 'production') {
        throw new DatabaseUnavailableError('PostgreSQL query failed in production environment');
      }
      logger.warn('Failed querying PostgreSQL for products, serving development baseline:', err.message);
    }
  }

  // In production, do not silently fallback if DB is offline
  if (env.NODE_ENV === 'production' && !getDatabaseStatus()) {
    throw new DatabaseUnavailableError('PostgreSQL is offline in production environment');
  }

  // Fallback in-memory querying (development only)
  let list = [...FALLBACK_PRODUCTS];

  if (cleanCategory && cleanCategory.toLowerCase() !== 'all') {
    list = list.filter((p) => p.category.toLowerCase() === cleanCategory.toLowerCase());
  }

  if (cleanSearch) {
    const q = cleanSearch.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.specDescription.toLowerCase().includes(q)
    );
  }

  if (parsedMin !== null) {
    list = list.filter((p) => p.priceInr >= parsedMin);
  }
  if (parsedMax !== null) {
    list = list.filter((p) => p.priceInr <= parsedMax);
  }

  if (sortKey === 'price_asc' || sortKey === 'low' || sortKey === 'price_low') {
    list.sort((a, b) => a.priceInr - b.priceInr);
  } else if (sortKey === 'price_desc' || sortKey === 'high' || sortKey === 'price_high') {
    list.sort((a, b) => b.priceInr - a.priceInr);
  } else if (sortKey === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sortKey === 'newest' || sortKey === 'new') {
    list.reverse();
  }

  const totalCount = list.length;
  if (isPaginated) {
    const paginatedList = list.slice((p - 1) * l, p * l);
    return {
      products: paginatedList,
      totalCount,
      pagination: {
        page: p,
        limit: l,
        totalCount,
        totalPages: Math.ceil(totalCount / l) || 1
      }
    };
  }

  return {
    products: list,
    totalCount
  };
}

export async function getProductById(id) {
  if (getDatabaseStatus() && prisma) {
    try {
      const found = await prisma.product.findUnique({ where: { id } });
      if (found) return found;
    } catch (err) {
      if (env.NODE_ENV === 'production') {
        throw new DatabaseUnavailableError(`PostgreSQL query for product ${id} failed in production`);
      }
      logger.warn(`Failed querying DB for product ${id}:`, err.message);
    }
  }

  if (env.NODE_ENV === 'production' && !getDatabaseStatus()) {
    throw new DatabaseUnavailableError('PostgreSQL is offline in production environment');
  }

  return FALLBACK_PRODUCTS.find((p) => p.id === id) || null;
}

export async function getAllCategories() {
  if (getDatabaseStatus() && prisma) {
    try {
      const distinct = await prisma.product.findMany({
        select: { category: true },
        distinct: ['category']
      });
      if (distinct.length > 0) {
        const found = distinct.map((d) => d.category);
        const ordered = ['All'];
        for (const cat of FALLBACK_CATEGORIES) {
          if (cat !== 'All' && found.includes(cat) && !ordered.includes(cat)) {
            ordered.push(cat);
          }
        }
        for (const cat of found) {
          if (!ordered.includes(cat)) {
            ordered.push(cat);
          }
        }
        return ordered;
      }
    } catch (err) {
      if (env.NODE_ENV === 'production') {
        throw new DatabaseUnavailableError('PostgreSQL category lookup failed in production');
      }
      logger.warn('Failed querying DB for distinct categories:', err.message);
    }
  }

  if (env.NODE_ENV === 'production' && !getDatabaseStatus()) {
    throw new DatabaseUnavailableError('PostgreSQL is offline in production environment');
  }

  return FALLBACK_CATEGORIES;
}

