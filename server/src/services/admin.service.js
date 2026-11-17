import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * Returns comprehensive database-driven analytics for the Admin Dashboard.
 */
export async function getDashboardOverview() {
  const now = new Date();

  // Date Boundaries
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // 1. Revenue Calculations (Strictly CAPTURED payments on non-cancelled orders)
  const [
    totalRevenueAgg,
    todayRevenueAgg,
    monthRevenueAgg,
    prevMonthRevenueAgg
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: {
        status: 'CAPTURED',
        order: { status: { not: 'CANCELLED' } }
      },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: {
        status: 'CAPTURED',
        order: { status: { not: 'CANCELLED' } },
        createdAt: { gte: startOfToday }
      },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: {
        status: 'CAPTURED',
        order: { status: { not: 'CANCELLED' } },
        createdAt: { gte: startOfMonth }
      },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: {
        status: 'CAPTURED',
        order: { status: { not: 'CANCELLED' } },
        createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth }
      },
      _sum: { amount: true }
    })
  ]);

  const totalRevenue = Number(totalRevenueAgg._sum.amount || 0);
  const revenueToday = Number(todayRevenueAgg._sum.amount || 0);
  const revenueThisMonth = Number(monthRevenueAgg._sum.amount || 0);
  const revenuePrevMonth = Number(prevMonthRevenueAgg._sum.amount || 0);

  // 2. Orders Breakdown by Lifecycle Status
  const [
    totalOrders,
    pendingOrders,
    confirmedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ['PENDING', 'PENDING_PAYMENT'] } } }),
    prisma.order.count({ where: { status: 'CONFIRMED' } }),
    prisma.order.count({ where: { status: { in: ['PROCESSING', 'FABRICATING', 'READY_TO_SHIP'] } } }),
    prisma.order.count({ where: { status: { in: ['SHIPPED', 'OUT_FOR_DELIVERY'] } } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.order.count({ where: { status: 'CANCELLED' } })
  ]);

  // 3. Customers Metrics
  const [
    totalCustomers,
    newCustomersToday,
    newCustomersMonth
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startOfToday } } }),
    prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startOfMonth } } })
  ]);

  // 4. Products & Inventory Metrics
  const [
    totalProducts,
    activeProducts,
    outOfStockProducts,
    lowStockProducts
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isAvailable: true } }),
    prisma.product.count({ where: { stockQuantity: { lte: 0 } } }),
    prisma.product.count({ where: { stockQuantity: { gt: 0, lte: 5 } } })
  ]);

  // 5. Recent Activity: Latest 10 Orders
  const recentOrdersRaw = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      totalAmount: true,
      currency: true,
      status: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          status: true,
          method: true,
          providerPaymentId: true
        }
      }
    }
  });

  const recentOrders = recentOrdersRaw.map(ord => ({
    id: ord.id,
    orderNumber: ord.orderNumber,
    customerName: ord.user?.fullName || 'Guest Customer',
    customerEmail: ord.user?.email || 'N/A',
    orderDate: ord.createdAt,
    totalAmount: Number(ord.totalAmount),
    currency: ord.currency,
    orderStatus: ord.status,
    paymentStatus: ord.payments[0]?.status || (['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(ord.status) ? 'CAPTURED' : 'PENDING'),
    paymentMethod: ord.payments[0]?.method || null
  }));

  return {
    sales: {
      totalRevenue,
      today: revenueToday,
      currentMonth: revenueThisMonth,
      previousMonth: revenuePrevMonth,
      currency: 'INR'
    },
    orders: {
      total: totalOrders,
      pending: pendingOrders,
      confirmed: confirmedOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders
    },
    customers: {
      total: totalCustomers,
      newToday: newCustomersToday,
      newThisMonth: newCustomersMonth
    },
    products: {
      total: totalProducts,
      active: activeProducts,
      outOfStock: outOfStockProducts,
      lowStock: lowStockProducts
    },
    recentOrders
  };
}

/**
 * Returns paginated customer list with calculated lifetime spend and total orders.
 */
export async function getAdminCustomersList({ page = 1, limit = 15, search = null, registeredAfter = null } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
  const skip = (p - 1) * l;

  const where = { role: 'CUSTOMER' };

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { email: { contains: q, mode: 'insensitive' } },
      { fullName: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } }
    ];
  }

  if (registeredAfter) {
    const d = new Date(registeredAfter);
    if (!isNaN(d.getTime())) {
      where.createdAt = { gte: d };
    }
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: l,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            payments: {
              where: { status: 'CAPTURED' },
              select: { amount: true }
            }
          }
        }
      }
    }),
    prisma.user.count({ where })
  ]);

  const customers = users.map(user => {
    const orderCount = user.orders.length;
    const paidOrderValue = user.orders
      .filter(o => o.status !== 'CANCELLED' && o.payments && o.payments.length > 0)
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      orderCount,
      totalSpent: paidOrderValue
    };
  });

  return {
    customers,
    pagination: {
      page: p,
      limit: l,
      totalCount,
      totalPages: Math.ceil(totalCount / l) || 1
    }
  };
}

/**
 * Returns single customer details with order history and statistics.
 * Strictly excludes passwordHash, reset tokens, and sensitive auth secrets.
 */
export async function getAdminCustomerById(customerId) {
  const user = await prisma.user.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      role: true,
      isVerified: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      addresses: {
        select: {
          id: true,
          recipientName: true,
          phone: true,
          streetLine1: true,
          streetLine2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          isDefault: true
        }
      },
      orders: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          currency: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              productName: true,
              quantity: true,
              unitPrice: true,
              lineTotal: true
            }
          },
          payments: {
            where: { status: 'CAPTURED' },
            select: {
              status: true,
              providerPaymentId: true,
              amount: true,
              verifiedAt: true
            }
          },
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              status: true
            }
          }
        }
      }
    }
  });

  if (!user) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    error.code = 'CUSTOMER_NOT_FOUND';
    throw error;
  }

  const totalOrders = user.orders.length;
  const totalPaidAmount = user.orders
    .filter(o => o.status !== 'CANCELLED' && o.payments && o.payments.length > 0)
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return {
    customer: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      addresses: user.addresses,
      stats: {
        totalOrders,
        totalPaidAmount
      },
      orders: user.orders
    }
  };
}

