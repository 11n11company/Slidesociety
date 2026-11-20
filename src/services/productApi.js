import { products as localProducts, categories as localCategories } from '../data/products';

const API_BASE = '/api/v1';

/**
 * Normalizes backend Product schema and frontend catalog format into a unified product model.
 */
export function normalizeProduct(p) {
  if (!p) return null;
  const priceNum = typeof p.priceInr === 'number' 
    ? p.priceInr 
    : (typeof p.price === 'number' ? p.price : parseFloat(p.priceInr || p.price || 0));

  return {
    ...p,
    id: p.id,
    name: p.name,
    cat: p.category || p.cat || 'General',
    category: p.category || p.cat || 'General',
    price: priceNum,
    priceInr: priceNum,
    priceEur: p.priceEurDisplay || p.priceEur || '',
    priceEurDisplay: p.priceEurDisplay || p.priceEur || '',
    spec: p.specDescription || p.spec || '',
    specDescription: p.specDescription || p.spec || '',
    compat: p.compatibilityNotes || p.compat || '',
    compatibilityNotes: p.compatibilityNotes || p.compat || '',
    rating: typeof p.rating === 'number' ? p.rating : 5.0,
    available: p.isAvailable !== undefined ? Boolean(p.isAvailable) : (p.available !== undefined ? Boolean(p.available) : true),
    isAvailable: p.isAvailable !== undefined ? Boolean(p.isAvailable) : (p.available !== undefined ? Boolean(p.available) : true),
    image: p.imageUrl || p.image || '/hero-backdrop-hd.jpg',
    imageUrl: p.imageUrl || p.image || '/hero-backdrop-hd.jpg'
  };
}

export const productApi = {
  /**
   * Fetches products with optional search, category, price range, sorting, and pagination.
   */
  async getProducts(params = {}) {
    const query = new URLSearchParams();

    if (params.category && params.category !== 'All') {
      query.set('category', params.category.trim());
    }
    if (params.search && params.search.trim()) {
      query.set('search', params.search.trim());
    }
    if (params.minPrice !== undefined && params.minPrice !== '' && !isNaN(Number(params.minPrice))) {
      query.set('minPrice', params.minPrice);
    }
    if (params.maxPrice !== undefined && params.maxPrice !== '' && !isNaN(Number(params.maxPrice))) {
      query.set('maxPrice', params.maxPrice);
    }
    if (params.sortBy && params.sortBy !== 'featured') {
      query.set('sortBy', params.sortBy);
    }
    if (params.page) {
      query.set('page', params.page);
    }
    if (params.limit) {
      query.set('limit', params.limit);
    }

    const qs = query.toString();
    const url = `${API_BASE}/products${qs ? `?${qs}` : ''}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const json = await res.json();
      if (json && json.success && json.data) {
        const rawProducts = json.data.products || [];
        return {
          products: rawProducts.map(normalizeProduct),
          count: json.data.count ?? rawProducts.length,
          pagination: json.data.pagination || null
        };
      }
    } catch (err) {
      console.warn('API fetch failed, utilizing client-side fallback:', err.message);
    }

    // Client-side in-memory fallback
    let list = localProducts.map(normalizeProduct);

    if (params.category && params.category !== 'All') {
      const catLower = params.category.trim().toLowerCase();
      list = list.filter((p) => p.cat.toLowerCase() === catLower);
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.cat.toLowerCase().includes(q) ||
          p.spec.toLowerCase().includes(q)
      );
    }

    if (params.minPrice !== undefined && params.minPrice !== '' && !isNaN(Number(params.minPrice))) {
      list = list.filter((p) => p.price >= parseFloat(params.minPrice));
    }
    if (params.maxPrice !== undefined && params.maxPrice !== '' && !isNaN(Number(params.maxPrice))) {
      list = list.filter((p) => p.price <= parseFloat(params.maxPrice));
    }

    if (params.sortBy === 'price_asc' || params.sortBy === 'low') {
      list.sort((a, b) => a.price - b.price);
    } else if (params.sortBy === 'price_desc' || params.sortBy === 'high') {
      list.sort((a, b) => b.price - a.price);
    } else if (params.sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return {
      products: list,
      count: list.length,
      pagination: null
    };
  },

  /**
   * Fetches distinct categories.
   */
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Categories API fetch failed, utilizing client-side fallback:', err.message);
    }
    return localCategories;
  }
};
