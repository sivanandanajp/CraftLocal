
const API_URL = 'http://localhost:5000/api/products';

const getId = (product) =>
  String(product?._id || product?.id || '');

const getCategory = (product) => {
  const category = product?.category;

  if (typeof category === 'string') {
    return category.trim();
  }

  if (category && typeof category === 'object') {
    return String(
      category.name || category.title || ''
    ).trim();
  }

  return '';
};

const normalizeCategory = (category) =>
  String(category || '').trim().toLowerCase();

const getProductList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data?.products)) {
    return data.data.products;
  }
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

/**
 * Fetch products from the existing API.
 */
export async function fetchProducts(options = {}) {
  const { signal, limit = 100 } = options;

  const params = new URLSearchParams({
    page: '1',
    limit: String(limit),
  });

  const response = await fetch(
    `${API_URL}?${params.toString()}`,
    { signal }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.message || 'Unable to load products.'
    );
  }

  return getProductList(data);
}

/**
 * Recommend products in the same category first.
 * Exclude the currently viewed product.
 * Fill remaining slots with other categories.
 */
export function getRecommendations(
  currentProduct,
  products,
  limit = 8
) {
  if (!currentProduct || !Array.isArray(products)) {
    return [];
  }

  const currentId = getId(currentProduct);
  const currentCategory = normalizeCategory(
    getCategory(currentProduct)
  );

  const otherProducts = products.filter(
    (product) =>
      getId(product) &&
      getId(product) !== currentId
  );

  const sameCategoryProducts = otherProducts.filter(
    (product) =>
      currentCategory &&
      normalizeCategory(getCategory(product)) ===
        currentCategory
  );

  const otherCategoryProducts = otherProducts.filter(
    (product) =>
      !currentCategory ||
      normalizeCategory(getCategory(product)) !==
        currentCategory
  );

  return [
    ...sameCategoryProducts,
    ...otherCategoryProducts,
  ].slice(0, limit);
}

/**
 * Fetch and select recommendations in one function.
 */
export async function fetchRecommendations(
  currentProduct,
  options = {}
) {
  const { signal, limit = 8 } = options;

  const products = await fetchProducts({
    signal,
    limit: 100,
  });

  return getRecommendations(
    currentProduct,
    products,
    limit
  );
}
