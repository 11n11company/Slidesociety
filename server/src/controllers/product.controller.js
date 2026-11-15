import { getAllProducts, getProductById, getAllCategories } from '../services/product.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export async function getProducts(req, res, next) {
  try {
    const { category, search, minPrice, maxPrice, sortBy } = req.query;
    const products = await getAllProducts({ category, search, minPrice, maxPrice, sortBy });
    return ApiResponse.success(res, {
      count: products.length,
      products
    }, 'Product catalogue retrieved successfully');
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

