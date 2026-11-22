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

export const FALLBACK_PRODUCTS = [];

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

