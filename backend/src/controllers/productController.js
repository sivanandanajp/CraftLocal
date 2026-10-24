
const Product = require('../models/Product.js');

// Calculate distance between two GPS coordinates in kilometres.
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const latitudeDifference = toRadians(lat2 - lat1);
  const longitudeDifference = toRadians(lon2 - lon1);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(longitudeDifference / 2) ** 2;

  const centralAngle = 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );

  return earthRadiusKm * centralAngle;
};

// Escape user input before using it in a regular expression.
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Seller and creator accounts can manage their own products.
const canManageProducts = (req, res) => {
  if (!['seller', 'creator'].includes(req.user?.role)) {
    res.status(403).json({
      message: 'Only sellers and creators can manage products.',
    });
    return false;
  }

  return true;
};

// Validate product IDs.
const isValidProductId = (id) =>
  /^[0-9a-fA-F]{24}$/.test(id);

// Validate and normalize product input.
const validateProductInput = (body, partial = false) => {
  const errors = [];
  const data = {};

  const stringFields = [
    'name',
    'description',
    'image',
    'category',
  ];

  for (const field of stringFields) {
    if (body[field] === undefined && partial) continue;

    if (
      typeof body[field] !== 'string' ||
      !body[field].trim()
    ) {
      errors.push(`${field} is required.`);
    } else {
      data[field] = body[field].trim();
    }
  }

  if (body.price !== undefined || !partial) {
    const price = Number(body.price);

    if (
      body.price === '' ||
      body.price === null ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      errors.push('Price must be a valid non-negative number.');
    } else {
      data.price = price;
    }
  }

  if (body.stock !== undefined || !partial) {
    const stock = Number(body.stock);

    if (
      body.stock === '' ||
      body.stock === null ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      errors.push('Stock must be a non-negative whole number.');
    } else {
      data.stock = stock;
    }
  }

  if (body.artisanLocation !== undefined) {
    if (
      !body.artisanLocation ||
      typeof body.artisanLocation !== 'object' ||
      Array.isArray(body.artisanLocation)
    ) {
      errors.push('Artisan location must be an object.');
    } else {
      const location = body.artisanLocation;
      const normalizedLocation = {};

      for (const field of [
        'city',
        'district',
        'state',
        'postalCode',
      ]) {
        if (location[field] !== undefined) {
          if (typeof location[field] !== 'string') {
            errors.push(`${field} must be text.`);
          } else {
            normalizedLocation[field] = location[field].trim();
          }
        }
      }

      for (const field of ['latitude', 'longitude']) {
        if (location[field] !== undefined) {
          const value = location[field];

          if (value === null || value === '') {
            normalizedLocation[field] = null;
            continue;
          }

          const number = Number(value);
          const min = field === 'latitude' ? -90 : -180;
          const max = field === 'latitude' ? 90 : 180;

          if (
            !Number.isFinite(number) ||
            number < min ||
            number > max
          ) {
            errors.push(`${field} is outside its valid range.`);
          } else {
            normalizedLocation[field] = number;
          }
        }
      }

      data.artisanLocation = normalizedLocation;
    }
  }

  return { errors, data };
};

// @desc Get products with search, filters, sorting, pagination and nearby search
// @route GET /api/products
// @access Public
const getProducts = async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit,
      city,
      district,
      state,
      postalCode,
      location,
      latitude,
      longitude,
      radiusKm,
    } = req.query;

    const query = {};

    // Keyword search.
    if (keyword && keyword.trim()) {
      const escapedKeyword = escapeRegex(keyword.trim());

      query.$or = [
        { name: { $regex: escapedKeyword, $options: 'i' } },
        {
          description: {
            $regex: escapedKeyword,
            $options: 'i',
          },
        },
      ];
    }

    // Category filter.
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search city, district, state or postal code.
    if (location && location.trim()) {
      const escapedLocation = escapeRegex(location.trim());

      const locationConditions = [
        {
          'artisanLocation.city': {
            $regex: escapedLocation,
            $options: 'i',
          },
        },
        {
          'artisanLocation.district': {
            $regex: escapedLocation,
            $options: 'i',
          },
        },
        {
          'artisanLocation.state': {
            $regex: escapedLocation,
            $options: 'i',
          },
        },
        {
          'artisanLocation.postalCode': {
            $regex: escapedLocation,
            $options: 'i',
          },
        },
      ];

      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: locationConditions },
        ];

        delete query.$or;
      } else {
        query.$or = locationConditions;
      }
    }

    // Exact location filters.
    const locationFilters = [
      ['city', city],
      ['district', district],
      ['state', state],
      ['postalCode', postalCode],
    ];

    for (const [field, value] of locationFilters) {
      if (typeof value === 'string' && value.trim()) {
        query[`artisanLocation.${field}`] = {
          $regex: `^${escapeRegex(value.trim())}$`,
          $options: 'i',
        };
      }
    }

    // Price filters.
    if (minPrice !== undefined && minPrice !== '') {
      const min = Number(minPrice);

      if (!Number.isFinite(min) || min < 0) {
        return res.status(400).json({
          message: 'Minimum price must be a valid non-negative number.',
        });
      }

      query.price = { ...query.price, $gte: min };
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      const max = Number(maxPrice);

      if (!Number.isFinite(max) || max < 0) {
        return res.status(400).json({
          message: 'Maximum price must be a valid non-negative number.',
        });
      }

      query.price = { ...query.price, $lte: max };
    }

    if (
      query.price?.$gte !== undefined &&
      query.price?.$lte !== undefined &&
      query.price.$gte > query.price.$lte
    ) {
      return res.status(400).json({
        message: 'Minimum price cannot exceed maximum price.',
      });
    }

    // Sorting.
    let sortOptions = { createdAt: -1 };

    if (sortBy === 'price-low') {
      sortOptions = { price: 1, _id: 1 };
    } else if (sortBy === 'price-high') {
      sortOptions = { price: -1, _id: 1 };
    } else if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sortBy === 'nameAsc') {
      sortOptions = { name: 1, _id: 1 };
    }

    // Pagination.
    const pageNum =
      page === undefined || page === '' ? 1 : Number(page);

    const limitNum =
      limit === undefined || limit === '' ? 8 : Number(limit);

    if (
      !Number.isInteger(pageNum) ||
      pageNum < 1 ||
      !Number.isInteger(limitNum) ||
      limitNum < 1 ||
      limitNum > 100
    ) {
      return res.status(400).json({
        message: 'Invalid pagination values.',
      });
    }

    const skip = (pageNum - 1) * limitNum;

    // Nearby search activates when GPS coordinates are provided.
    const hasLatitude = latitude !== undefined && latitude !== '';
    const hasLongitude = longitude !== undefined && longitude !== '';
    const hasRadius = radiusKm !== undefined && radiusKm !== '';

    if (hasLatitude !== hasLongitude) {
      return res.status(400).json({
        message: 'Provide both latitude and longitude.',
      });
    }

    if (hasRadius && !hasLatitude) {
      return res.status(400).json({
        message: 'GPS coordinates are required for nearby search.',
      });
    }

    if (hasLatitude && hasLongitude) {
      const userLatitude = Number(latitude);
      const userLongitude = Number(longitude);
      const radius = hasRadius ? Number(radiusKm) : 10;

      if (
        !Number.isFinite(userLatitude) ||
        userLatitude < -90 ||
        userLatitude > 90 ||
        !Number.isFinite(userLongitude) ||
        userLongitude < -180 ||
        userLongitude > 180
      ) {
        return res.status(400).json({
          message: 'Invalid GPS coordinates.',
        });
      }

      if (
        !Number.isFinite(radius) ||
        radius <= 0 ||
        radius > 500
      ) {
        return res.status(400).json({
          message: 'Radius must be greater than 0 and at most 500 km.',
        });
      }

      query['artisanLocation.latitude'] = {
        $gte: -90,
        $lte: 90,
      };

      query['artisanLocation.longitude'] = {
        $gte: -180,
        $lte: 180,
      };

      const matchingProducts = await Product.find(query).lean();

      const nearbyProducts = matchingProducts
        .map((product) => {
          const artisanLatitude = product.artisanLocation?.latitude;
          const artisanLongitude = product.artisanLocation?.longitude;

          if (
            typeof artisanLatitude !== 'number' ||
            typeof artisanLongitude !== 'number'
          ) {
            return null;
          }

          const distanceKm = calculateDistanceKm(
            userLatitude,
            userLongitude,
            artisanLatitude,
            artisanLongitude
          );

          return {
            ...product,
            distanceKm: Number(distanceKm.toFixed(2)),
          };
        })
        .filter(
          (product) =>
            product !== null && product.distanceKm <= radius
        );

      nearbyProducts.sort((a, b) => {
        if (a.distanceKm !== b.distanceKm) {
          return a.distanceKm - b.distanceKm;
        }

        return String(a._id).localeCompare(String(b._id));
      });

      const totalProducts = nearbyProducts.length;
      const totalPages = Math.ceil(totalProducts / limitNum);

      return res.status(200).json({
        products: nearbyProducts.slice(skip, skip + limitNum),
        page: pageNum,
        totalPages,
        totalProducts,
        nearbySearch: true,
        radiusKm: radius,
      });
    }

    // Normal product listing, without GPS.
    const totalProducts = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalProducts / limitNum);

    return res.status(200).json({
      products,
      page: pageNum,
      totalPages,
      totalProducts,
      nearbySearch: false,
    });
  } catch (error) {
    console.error('Get Products Error:', error);

    return res.status(500).json({
      message: 'Server error fetching products.',
    });
  }
};

// @desc Get unique artisan cities
// @route GET /api/products/locations
// @access Public
const getProductLocations = async (req, res) => {
  try {
    const locations = await Product.distinct('artisanLocation.city');

    const normalizedCities = locations
      .filter((city) => typeof city === 'string' && city.trim())
      .map((city) => city.trim());

    // Remove duplicate names, including differences in capitalization.
    const cityMap = new Map();

    normalizedCities.forEach((city) => {
      const key = city.toLocaleLowerCase('en-IN');

      if (!cityMap.has(key)) {
        cityMap.set(key, city);
      }
    });

    const cities = [...cityMap.values()].sort((a, b) =>
      a.localeCompare(b)
    );

    return res.status(200).json({
      locations: cities,
    });
  } catch (error) {
    console.error('Get Product Locations Error:', error);

    return res.status(500).json({
      message: 'Server error fetching artisan locations.',
    });
  }
};

// @desc Get a single product by ID
// @route GET /api/products/:id
// @access Public
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!isValidProductId(productId)) {
      return res.status(400).json({
        message: 'Invalid product ID.',
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found.',
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error('Get Product By ID Error:', error);

    return res.status(500).json({
      message: 'Server error fetching product.',
    });
  }
};

// @desc Get products belonging to the authenticated seller
// @route GET /api/products/my-products
// @access Private (seller/creator)
const getMyProducts = async (req, res) => {
  try {
    if (!canManageProducts(req, res)) return;

    const products = await Product.find({
      sellerId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      products,
      totalProducts: products.length,
    });
  } catch (error) {
    console.error('Get My Products Error:', error);

    return res.status(500).json({
      message: 'Server error fetching your products.',
    });
  }
};

// @desc Create a product for the authenticated seller
// @route POST /api/products
// @access Private (seller/creator)
const createProduct = async (req, res) => {
  try {
    if (!canManageProducts(req, res)) return;

    const { errors, data } = validateProductInput(req.body);

    if (errors.length) {
      return res.status(400).json({
        message: errors[0],
        errors,
      });
    }

    const product = await Product.create({
      ...data,
      sellerId: req.user._id,
    });

    return res.status(201).json({
      message: 'Product created successfully.',
      product,
    });
  } catch (error) {
    console.error('Create Product Error:', error);

    return res.status(500).json({
      message: 'Server error creating product.',
    });
  }
};

// @desc Update a product owned by the authenticated seller
// @route PUT /api/products/my-products/:id
// @access Private (seller/creator)
const updateMyProduct = async (req, res) => {
  try {
    if (!canManageProducts(req, res)) return;

    const { id } = req.params;

    if (!isValidProductId(id)) {
      return res.status(400).json({
        message: 'Invalid product ID.',
      });
    }

    const allowedFields = [
      'name',
      'description',
      'price',
      'image',
      'category',
      'stock',
      'artisanLocation',
    ];

    const submittedFields = Object.keys(req.body || {});
    const unexpectedFields = submittedFields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (unexpectedFields.length) {
      return res.status(400).json({
        message: `Fields cannot be updated: ${unexpectedFields.join(', ')}`,
      });
    }

    const { errors, data } = validateProductInput(req.body, true);

    if (errors.length) {
      return res.status(400).json({
        message: errors[0],
        errors,
      });
    }

    const product = await Product.findOne({
      _id: id,
      sellerId: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        message: 'Product not found in your store.',
      });
    }

    product.set(data);
    await product.save();

    return res.status(200).json({
      message: 'Product updated successfully.',
      product,
    });
  } catch (error) {
    console.error('Update Product Error:', error);

    return res.status(500).json({
      message: 'Server error updating product.',
    });
  }
};

// @desc Delete a product owned by the authenticated seller
// @route DELETE /api/products/my-products/:id
// @access Private (seller/creator)
const deleteMyProduct = async (req, res) => {
  try {
    if (!canManageProducts(req, res)) return;

    const { id } = req.params;

    if (!isValidProductId(id)) {
      return res.status(400).json({
        message: 'Invalid product ID.',
      });
    }

    const product = await Product.findOneAndDelete({
      _id: id,
      sellerId: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        message: 'Product not found in your store.',
      });
    }

    return res.status(200).json({
      message: 'Product deleted successfully.',
      productId: id,
    });
  } catch (error) {
    console.error('Delete Product Error:', error);

    return res.status(500).json({
      message: 'Server error deleting product.',
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductLocations,
  getMyProducts,
  createProduct,
  updateMyProduct,
  deleteMyProduct,
};
