import { getAllProducts, getProductById, getAllCategories } from '../services/product.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export async function getProducts(req, res, next) {
  try {
    const { category, search, minPrice, maxPrice, sortBy, page, limit } = req.query;

    // Validate minPrice
    if (minPrice !== undefined && minPrice !== '') {
      const numMin = Number(minPrice);
      if (isNaN(numMin) || numMin < 0) {
        return ApiResponse.error(res, 'Invalid minPrice: must be a non-negative number', 400);
      }
    }

    // Validate maxPrice
    if (maxPrice !== undefined && maxPrice !== '') {
      const numMax = Number(maxPrice);
      if (isNaN(numMax) || numMax < 0) {
        return ApiResponse.error(res, 'Invalid maxPrice: must be a non-negative number', 400);
      }
    }

    // Validate price range bounds
    if (
      minPrice !== undefined &&
      minPrice !== '' &&
      maxPrice !== undefined &&
      maxPrice !== ''
    ) {
      if (Number(minPrice) > Number(maxPrice)) {
        return ApiResponse.error(res, 'Minimum price cannot exceed maximum price', 400);
      }
    }

    // Validate pagination parameters
    if (page !== undefined && page !== '') {
      const numPage = parseInt(page, 10);
      if (isNaN(numPage) || numPage < 1) {
        return ApiResponse.error(res, 'Invalid page: must be a positive integer', 400);
      }
    }

    if (limit !== undefined && limit !== '') {
      const numLimit = parseInt(limit, 10);
      if (isNaN(numLimit) || numLimit < 1) {
        return ApiResponse.error(res, 'Invalid limit: must be a positive integer', 400);
      }
    }

    const result = await getAllProducts({
      category,
      search,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit
    });

    const responsePayload = {
      count: result.products.length,
      products: result.products
    };

    if (result.pagination) {
      responsePayload.pagination = result.pagination;
    }

    return ApiResponse.success(res, responsePayload, 'Product catalogue retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    if (!product) {
      return ApiResponse.error(res, `Product with ID "${id}" was not found`, 404);
    }
    return ApiResponse.success(res, product, 'Product details retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req, res, next) {
  try {
    const categories = await getAllCategories();
    return ApiResponse.success(res, categories, 'Categories retrieved successfully');
  } catch (error) {
    next(error);
  }
}

