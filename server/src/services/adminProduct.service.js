import { z } from 'zod';
import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

export const createProductSchema = z.object({
  id: z.string().trim().min(2, 'Slug ID must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug ID must be lowercase alphanumeric with hyphens'),
  name: z.string().trim().min(2).optional(),
  title: z.string().trim().min(2).optional(),
  category: z.string().trim().min(2, 'Category must be specified'),
  priceInr: z.number().positive('Price must be greater than zero').optional(),
  price: z.number().positive('Price must be greater than zero').optional(),
  priceEurDisplay: z.string().trim().optional(),
  specDescription: z.string().trim().optional(),
  description: z.string().trim().optional(),
  compatibilityNotes: z.string().trim().optional(),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative').default(50),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  imageUrl: z.string().trim().min(1, 'Product image URL is required').optional(),
  specs: z.any().optional(),
  features: z.any().optional(),
  rating: z.number().min(1).max(5).default(5.0)
}).transform(data => {
  const name = data.name || data.title;
  const priceInr = data.priceInr !== undefined ? data.priceInr : data.price;
  const specDescription = data.specDescription || data.description || '';
  if (!name) throw new Error('Product name or title is required');
  if (priceInr === undefined || priceInr <= 0) throw new Error('Price must be greater than zero');
  return {
    ...data,
    name,
    priceInr,
    specDescription,
    imageUrl: data.imageUrl || '/hero-backdrop-hd.jpg'
  };
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(2).optional(),
  title: z.string().trim().min(2).optional(),
  category: z.string().trim().min(2).optional(),
  priceInr: z.number().positive('Price must be greater than zero').optional(),
  price: z.number().positive('Price must be greater than zero').optional(),
  priceEurDisplay: z.string().trim().optional(),
  specDescription: z.string().trim().optional(),
  description: z.string().trim().optional(),
  compatibilityNotes: z.string().trim().optional(),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative').optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  imageUrl: z.string().trim().min(1).optional(),
  specs: z.any().optional(),
  features: z.any().optional(),
  rating: z.number().min(1).max(5).optional()
}).transform(data => {
  const res = { ...data };
  if (data.title && !data.name) res.name = data.title;
  if (data.price !== undefined && data.priceInr === undefined) res.priceInr = data.price;
  if (data.description && !data.specDescription) res.specDescription = data.description;
  return res;
});

export const updateStockSchema = z.object({
  stockQuantity: z.number().int().min(0, 'Stock quantity must be zero or positive').optional(),
  delta: z.number().int().optional()
}).refine(data => data.stockQuantity !== undefined || data.delta !== undefined, {
  message: 'Must provide either stockQuantity (absolute) or delta (adjustment)'
});

export function formatAdminProduct(prod) {
  if (!prod) return null;
  const reserved = prod.reservedQuantity || 0;
  const available = Math.max(0, prod.stockQuantity - reserved);
  return {
    ...prod,
    price: Number(prod.priceInr),
    priceInr: Number(prod.priceInr),
    title: prod.name,
    name: prod.name,
    description: prod.specDescription,
    specDescription: prod.specDescription,
    physicalStock: prod.stockQuantity,
    reservedQuantity: reserved,
    availableStock: available,
    availableQuantity: available,
    orderCount: prod._count?.orderItems !== undefined ? prod._count.orderItems : undefined
  };
}

/**
 * Admin: List all products with stock and status
 */
export async function getAdminProducts({
  page = 1,
  limit = 20,
  search = null,
  category = null,
  isAvailable = null,
  sortBy = 'createdAt',
  sortOrder = 'desc'
} = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (p - 1) * l;

  const where = {};

  if (category && category !== 'ALL') {
    where.category = { equals: category, mode: 'insensitive' };
  }

  if (isAvailable !== null && isAvailable !== undefined && isAvailable !== '') {
    where.isAvailable = isAvailable === 'true' || isAvailable === true;
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { id: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } },
      { category: { contains: q, mode: 'insensitive' } },
      { specDescription: { contains: q, mode: 'insensitive' } }
    ];
  }

  const validSortFields = ['name', 'priceInr', 'stockQuantity', 'createdAt', 'rating'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const orderDirection = sortOrder === 'asc' ? 'asc' : 'desc';

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: l,
      orderBy: { [sortField]: orderDirection },
      include: {
        _count: {
          select: { orderItems: true }
        }
      }
    }),
    prisma.product.count({ where })
  ]);

  return {
    products: products.map(formatAdminProduct),
    pagination: {
      page: p,
      limit: l,
      totalCount,
      totalPages: Math.ceil(totalCount / l) || 1
    }
  };
}

/**
 * Admin: Retrieve a single product by ID
 */
export async function getAdminProductById(productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      _count: {
        select: { orderItems: true }
      }
    }
  });

  if (!product) {
    const error = new Error(`Product [${productId}] not found`);
    error.statusCode = 404;
    error.code = 'PRODUCT_NOT_FOUND';
    throw error;
  }

  return formatAdminProduct(product);
}

/**
 * Admin: Create a new product with validated inputs
 */
export async function createAdminProduct(data) {
  const validated = createProductSchema.parse(data);

  // Check slug ID collision
  const existing = await prisma.product.findUnique({
    where: { id: validated.id }
  });

  if (existing) {
    const error = new Error(`A product with identifier slug '${validated.id}' already exists.`);
    error.statusCode = 400;
    error.code = 'PRODUCT_SLUG_EXISTS';
    throw error;
  }

  const product = await prisma.product.create({
    data: {
      id: validated.id,
      name: validated.name,
      category: validated.category,
      priceInr: validated.priceInr,
      priceEurDisplay: validated.priceEurDisplay || null,
      specDescription: validated.specDescription,
      compatibilityNotes: validated.compatibilityNotes || null,
      stockQuantity: validated.stockQuantity,
      isAvailable: validated.isAvailable,
      imageUrl: validated.imageUrl,
      rating: validated.rating
    }
  });

  logger.info(`Admin created new product: [${product.id}] ${product.name}`);
  return formatAdminProduct(product);
}

/**
 * Admin: Update permitted fields of an existing product
 */
export async function updateAdminProduct(productId, data) {
  const validated = updateProductSchema.parse(data);

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    const error = new Error(`Product [${productId}] not found`);
    error.statusCode = 404;
    error.code = 'PRODUCT_NOT_FOUND';
    throw error;
  }

  const updateData = {};
  if (validated.name !== undefined) updateData.name = validated.name;
  if (validated.category !== undefined) updateData.category = validated.category;
  if (validated.priceInr !== undefined) updateData.priceInr = validated.priceInr;
  if (validated.priceEurDisplay !== undefined) updateData.priceEurDisplay = validated.priceEurDisplay;
  if (validated.specDescription !== undefined) updateData.specDescription = validated.specDescription;
  if (validated.compatibilityNotes !== undefined) updateData.compatibilityNotes = validated.compatibilityNotes;
  if (validated.stockQuantity !== undefined) updateData.stockQuantity = validated.stockQuantity;
  if (validated.isAvailable !== undefined) updateData.isAvailable = validated.isAvailable;
  if (validated.imageUrl !== undefined) updateData.imageUrl = validated.imageUrl;
  if (validated.rating !== undefined) updateData.rating = validated.rating;

  const updated = await prisma.product.update({
    where: { id: productId },
    data: updateData
  });

  logger.info(`Admin updated product [${productId}]: ${JSON.stringify(updateData)}`);
  return formatAdminProduct(updated);
}

/**
 * Admin: Safe delete product
 * If referenced in historical order items, permanently deleting is blocked (foreign key Restrict);
 * it is safely deactivated instead.
 */
export async function deleteAdminProduct(productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      _count: {
        select: { orderItems: true }
      }
    }
  });

  if (!product) {
    const error = new Error(`Product [${productId}] not found`);
    error.statusCode = 404;
    error.code = 'PRODUCT_NOT_FOUND';
    throw error;
  }

  if (product._count.orderItems > 0) {
    // Soft-deactivate to protect historical orders and relational integrity
    const deactivated = await prisma.product.update({
      where: { id: productId },
      data: { isAvailable: false }
    });
    logger.warn(`Product [${productId}] has ${product._count.orderItems} historical order references. Deactivated instead of deleted.`);
    return {
      deleted: false,
      deactivated: true,
      message: `Product cannot be permanently deleted because ${product._count.orderItems} historical order item records depend on it. It has been deactivated instead.`,
      product: formatAdminProduct(deactivated)
    };
  }

  // No order references exist; safe to permanently delete
  await prisma.product.delete({
    where: { id: productId }
  });

  logger.info(`Admin permanently deleted unreferenced product [${productId}]`);
  return {
    deleted: true,
    deactivated: false,
    message: `Product [${productId}] successfully deleted.`
  };
}

/**
 * Admin: Retrieve inventory summary and stock levels
 */
export async function getAdminInventory({
  page = 1,
  limit = 20,
  status = null, // 'OUT_OF_STOCK', 'LOW_STOCK', 'IN_STOCK'
  search = null
} = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (p - 1) * l;

  const where = {};

  if (status === 'OUT_OF_STOCK') {
    where.stockQuantity = { lte: 0 };
  } else if (status === 'LOW_STOCK') {
    where.stockQuantity = { gt: 0, lte: 5 };
  } else if (status === 'IN_STOCK') {
    where.stockQuantity = { gt: 5 };
  }

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { id: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } },
      { category: { contains: q, mode: 'insensitive' } }
    ];
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: l,
      orderBy: { stockQuantity: 'asc' },
      select: {
        id: true,
        name: true,
        category: true,
        priceInr: true,
        stockQuantity: true,
        reservedQuantity: true,
        isAvailable: true,
        updatedAt: true
      }
    }),
    prisma.product.count({ where })
  ]);

  return {
    inventory: products.map(prod => {
      const reserved = prod.reservedQuantity || 0;
      const available = Math.max(0, prod.stockQuantity - reserved);
      return {
        ...prod,
        priceInr: Number(prod.priceInr),
        physicalStock: prod.stockQuantity,
        reservedQuantity: reserved,
        availableQuantity: available,
        stockStatus: available <= 0
          ? 'OUT_OF_STOCK'
          : available <= 5
          ? 'LOW_STOCK'
          : 'IN_STOCK'
      };
    }),
    pagination: {
      page: p,
      limit: l,
      totalCount,
      totalPages: Math.ceil(totalCount / l) || 1
    }
  };
}

/**
 * Admin: Update stock quantity with strict negative inventory prevention
 */
export async function updateProductStock(productId, input) {
  const validated = updateStockSchema.parse(input);

  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      const error = new Error(`Product [${productId}] not found`);
      error.statusCode = 404;
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    let newStock;
    if (validated.stockQuantity !== undefined) {
      newStock = validated.stockQuantity;
    } else {
      newStock = product.stockQuantity + validated.delta;
    }

    const activeReserved = product.reservedQuantity || 0;
    if (newStock < 0 || newStock < activeReserved) {
      const error = new Error(
        `Cannot reduce stock below active reserved quantity (${activeReserved}). Requested stock ${newStock} would make available inventory negative.`
      );
      error.statusCode = 400;
      error.code = 'NEGATIVE_INVENTORY_PROHIBITED';
      throw error;
    }

    const updated = await tx.product.update({
      where: { id: productId },
      data: {
        stockQuantity: newStock,
        isAvailable: newStock > 0 ? product.isAvailable : false
      }
    });

    logger.info(`Stock updated for [${productId}]: ${product.stockQuantity} -> ${newStock} (Reserved: ${activeReserved})`);
    return {
      id: updated.id,
      name: updated.name,
      previousStock: product.stockQuantity,
      currentStock: updated.stockQuantity,
      reservedQuantity: updated.reservedQuantity,
      availableQuantity: Math.max(0, updated.stockQuantity - (updated.reservedQuantity || 0)),
      isAvailable: updated.isAvailable
    };
  });
}
