
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

const API_URL = 'http://localhost:5000/api/products';
const ITEMS_PER_PAGE = 8;
const NEARBY_RADIUS_KM = 25;

const CATEGORY_OPTIONS = [
  'Home & Decor',
  'Jewelry & Accessories',
  'Handmade & Lifestyle',
  'Kitchen & Dining',
  'Art & Gifts',
  'Pottery',
  'Textiles',
  'Woodwork',
];

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(price) || 0);

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toggleItem, isSaved } = useWishlist();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const [availableLocations, setAvailableLocations] = useState([]);

  const [search, setSearch] = useState(
    searchParams.get('keyword') || ''
  );

  const [category, setCategory] = useState(
    searchParams.get('category') || 'All'
  );

  const [city, setCity] = useState(
    searchParams.get('city') || 'All'
  );

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [page, setPage] = useState(
    Number(searchParams.get('page')) || 1
  );

  const [totalPages, setTotalPages] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);

  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [nearbyMode, setNearbyMode] = useState(false);

  // Keep filters synchronized with the URL.
  useEffect(() => {
    setCategory(searchParams.get('category') || 'All');
    setSearch(searchParams.get('keyword') || '');
    setCity(searchParams.get('city') || 'All');
    setPage(Math.max(1, Number(searchParams.get('page')) || 1));
  }, [searchParams]);

  // Fetch the products for the current page.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams();

        if (search.trim()) {
          params.set('keyword', search.trim());
        }

        if (category !== 'All') {
          params.set('category', category);
        }

        if (!nearbyMode && city !== 'All') {
          params.set('city', city);
        }

        if (minPrice !== '') {
          params.set('minPrice', minPrice);
        }

        if (maxPrice !== '') {
          params.set('maxPrice', maxPrice);
        }

        if (sortBy === 'priceAsc') {
          params.set('sortBy', 'price-low');
        } else if (sortBy === 'priceDesc') {
          params.set('sortBy', 'price-high');
        } else if (sortBy === 'oldest') {
          params.set('sortBy', 'oldest');
        } else if (sortBy === 'nameAsc') {
          params.set('sortBy', 'nameAsc');
        }

        if (nearbyMode && userLocation) {
          params.set('latitude', String(userLocation.latitude));
          params.set('longitude', String(userLocation.longitude));
          params.set('radiusKm', String(NEARBY_RADIUS_KM));
        }

        params.set('page', String(page));
        params.set('limit', String(ITEMS_PER_PAGE));

        const response = await fetch(
          `${API_URL}?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          throw new Error(
            errorData.message ||
              'Unable to load products. Please try again.'
          );
        }

        const data = await response.json();

        const productList = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
            ? data.products
            : Array.isArray(data.data)
              ? data.data
              : [];

        setProducts(productList);

        const reportedPages = Number(data.totalPages);
        const reportedTotal = Number(
          data.totalProducts ?? data.total
        );

        setTotalPages(
          !Array.isArray(data) &&
            Number.isFinite(reportedPages) &&
            reportedPages > 0
            ? reportedPages
            : null
        );

        setTotalProducts(
          !Array.isArray(data) &&
            Number.isFinite(reportedTotal)
            ? reportedTotal
            : productList.length
        );
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Something went wrong.');
          setProducts([]);
          setTotalPages(null);
          setTotalProducts(0);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, [
    search,
    category,
    city,
    minPrice,
    maxPrice,
    sortBy,
    page,
    retryKey,
    nearbyMode,
    userLocation,
  ]);

  // Fetch all unique artisan cities from the dedicated backend endpoint.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchLocations() {
      try {
        const response = await fetch(`${API_URL}/locations`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Unable to load artisan locations.');
        }

        const data = await response.json();

        const receivedLocations = Array.isArray(data.locations)
          ? data.locations
          : [];

        const uniqueLocations = [
          ...new Map(
            receivedLocations
              .filter(
                (location) =>
                  typeof location === 'string' &&
                  location.trim() !== ''
              )
              .map((location) => {
                const trimmedLocation = location.trim();

                return [
                  trimmedLocation.toLocaleLowerCase('en-IN'),
                  trimmedLocation,
                ];
              })
          ).values(),
        ].sort((a, b) => a.localeCompare(b));

        setAvailableLocations(uniqueLocations);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Unable to load artisan locations:', err);
        }
      }
    }

    fetchLocations();

    return () => controller.abort();
  }, []);

  // Keep all eight catalogue categories visible.
  const categories = useMemo(() => {
    const fetchedCategories = products
      .map((product) => product.category)
      .filter(Boolean);

    return [
      'All',
      ...new Set([...CATEGORY_OPTIONS, ...fetchedCategories]),
    ];
  }, [products]);

  const updateUrlFilters = (updates) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === '' ||
        value === null ||
        value === undefined ||
        value === 'All'
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    setSearchParams(params);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(1);
    updateUrlFilters({ category: value, page: '' });
  };

  const handleCityChange = (value) => {
    setCity(value);
    setPage(1);
    updateUrlFilters({ city: value, page: '' });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        'Your browser does not support location services.'
      );
      return;
    }

    setLocationLoading(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setCity('All');
        setNearbyMode(true);
        setPage(1);
        setLocationLoading(false);

        updateUrlFilters({ city: '', page: '' });
      },
      (err) => {
        let message = 'Unable to get your location.';

        if (err.code === 1) {
          message =
            'Location permission was denied. Allow location access in your browser settings and try again.';
        } else if (err.code === 2) {
          message = 'Your current location is unavailable.';
        } else if (err.code === 3) {
          message = 'Location request timed out. Please try again.';
        }

        setLocationError(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      }
    );
  };

  const handleWishlistClick = (event, product) => {
    event.preventDefault();
    event.stopPropagation();
    toggleItem(product);
  };

  const clearFilters = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setPage(1);
    setCategory('All');
    setCity('All');
    setNearbyMode(false);
    setUserLocation(null);
    setLocationError('');
    setSearchParams({});
  };

  const canGoNext =
    totalPages !== null
      ? page < totalPages
      : products.length === ITEMS_PER_PAGE;

  const hasActiveFilters =
    search.trim() !== '' ||
    category !== 'All' ||
    city !== 'All' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    sortBy !== 'newest' ||
    nearbyMode;

  return (
    <main className="min-h-screen bg-[#FAF7F1] text-[#38291F]">
      <section className="mx-auto max-w-7xl px-5 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-14 lg:px-10">
        <div className="flex flex-col justify-between gap-6 border-b border-[#E8DDD0] pb-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#A65D45] sm:text-xs">
              The CraftLocal collection
            </p>

            <h1 className="font-headline text-4xl font-semibold leading-tight tracking-tight text-[#38291F] sm:text-5xl lg:text-6xl">
              Objects with a story.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#766A5E] sm:text-base">
              Thoughtfully handmade, beautifully individual.
              Discover meaningful pieces created by independent
              local artisans.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#766A5E]">
            <span className="text-xl text-[#A65D45]" aria-hidden="true">
              ✳
            </span>
            Made by hand. Chosen by you.
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-7 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A7B6E]"
            >
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.2 4.2" />
            </svg>

            <input
              type="search"
              aria-label="Search products"
              value={search}
              onChange={(event) => {
                const value = event.target.value;

                setSearch(value);
                setPage(1);

                updateUrlFilters({
                  keyword: value.trim(),
                  page: '',
                });
              }}
              placeholder="Find something special..."
              className="w-full rounded-full border border-[#E4D8CA] bg-white py-3.5 pl-12 pr-4 text-sm text-[#38291F] outline-none transition placeholder:text-[#9A8C80] focus:border-[#A65D45] focus:ring-2 focus:ring-[#A65D45]/10 sm:text-base"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label
              htmlFor="artisan-city"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#857568]"
            >
              <span aria-hidden="true">⌖</span>
              Artisan location
            </label>

            <select
              id="artisan-city"
              value={city}
              onChange={(event) => {
                setNearbyMode(false);
                setUserLocation(null);
                handleCityChange(event.target.value);
              }}
              className="w-full rounded-full border border-[#E4D8CA] bg-white px-4 py-3 text-sm text-[#38291F] outline-none transition focus:border-[#A65D45] focus:ring-2 focus:ring-[#A65D45]/10 sm:min-w-48"
            >
              <option value="All">All locations</option>

              {availableLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={locationLoading}
              className="whitespace-nowrap rounded-full border border-[#A65D45] bg-white px-4 py-3 text-sm font-medium text-[#A65D45] transition hover:bg-[#A65D45] hover:text-white disabled:cursor-wait disabled:opacity-60"
            >
              {locationLoading
                ? 'Getting location...'
                : '◎ Use my location'}
            </button>
          </div>
        </div>

        {locationError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {locationError}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#857568]">
            Explore
          </span>

          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleCategoryChange(item)}
              aria-pressed={category === item}
              className={`rounded-full border px-3.5 py-2 text-xs transition duration-200 sm:text-sm ${
                category === item
                  ? 'border-[#A65D45] bg-[#A65D45] text-white'
                  : 'border-[#E4D8CA] bg-transparent text-[#5C4C40] hover:border-[#A65D45] hover:bg-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 border-b border-[#E8DDD0] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="mr-1 text-xs font-medium text-[#857568]">
              Price range
            </span>

            <input
              type="number"
              min="0"
              aria-label="Minimum price"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(event) => {
                setMinPrice(event.target.value);
                setPage(1);
              }}
              className="w-24 rounded-full border border-[#E4D8CA] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#A65D45] focus:ring-2 focus:ring-[#A65D45]/10"
            />

            <span className="text-[#A39487]" aria-hidden="true">
              –
            </span>

            <input
              type="number"
              min="0"
              aria-label="Maximum price"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(event) => {
                setMaxPrice(event.target.value);
                setPage(1);
              }}
              className="w-24 rounded-full border border-[#E4D8CA] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#A65D45] focus:ring-2 focus:ring-[#A65D45]/10"
            />

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-1 rounded-full px-2 py-1 text-xs font-medium text-[#A65D45] underline underline-offset-4 transition hover:text-[#80452F]"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="product-sort"
              className="shrink-0 text-xs font-medium text-[#857568]"
            >
              Sort by
            </label>

            <select
              id="product-sort"
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                setPage(1);
              }}
              className="min-w-0 rounded-full border border-[#E4D8CA] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#A65D45] focus:ring-2 focus:ring-[#A65D45]/10"
            >
              <option value="newest">Recently added</option>
              <option value="priceAsc">Price: low to high</option>
              <option value="priceDesc">Price: high to low</option>
              <option value="nameAsc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A65D45] sm:text-[11px]">
              Curated for you
            </p>

            <h2 className="font-headline text-2xl font-semibold text-[#38291F] sm:text-3xl">
              {nearbyMode
                ? 'Nearby creations'
                : category === 'All'
                  ? 'All creations'
                  : category}
              {!nearbyMode && city !== 'All' ? ` in ${city}` : ''}
            </h2>
          </div>

          {!loading && !error && (
            <p className="text-xs text-[#857568] sm:text-sm">
              {totalProducts} {totalProducts === 1 ? 'piece' : 'pieces'}
              {totalPages !== null ? ` · Page ${page} of ${totalPages}` : ''}
            </p>
          )}
        </div>

        {loading && (
          <div
            className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4"
            aria-label="Loading products"
            aria-busy="true"
          >
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/5] rounded-sm bg-[#EEE5D9]" />
                <div className="mt-4 h-3 w-1/3 rounded bg-[#EEE5D9]" />
                <div className="mt-3 h-4 w-3/4 rounded bg-[#EEE5D9]" />
                <div className="mt-3 h-3 w-1/4 rounded bg-[#EEE5D9]" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="border border-[#E8DDD0] bg-white px-5 py-14 text-center sm:py-16">
            <span className="text-3xl text-[#A65D45]" aria-hidden="true">
              ✳
            </span>

            <h3 className="mt-4 font-headline text-2xl font-semibold">
              We couldn't load the collection.
            </h3>

            <p className="mt-3 text-sm text-[#857568]">{error}</p>

            <button
              type="button"
              onClick={() => setRetryKey((current) => current + 1)}
              className="mt-6 rounded-full bg-[#A65D45] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#874832]"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="border-y border-[#E8DDD0] py-16 text-center sm:py-20">
            <span className="text-4xl text-[#A65D45]" aria-hidden="true">
              ✳
            </span>

            <h3 className="mt-4 font-headline text-2xl font-semibold sm:text-3xl">
              {nearbyMode
                ? 'No artisans found nearby.'
                : 'Nothing here just yet.'}
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#857568]">
              {nearbyMode
                ? `No products with saved GPS coordinates were found within ${NEARBY_RADIUS_KM} km.`
                : 'Try another search or explore a different location.'}
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-full border border-[#A65D45] px-6 py-3 text-sm font-medium text-[#A65D45] transition hover:bg-[#A65D45] hover:text-white"
            >
              Explore all creations
            </button>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 sm:gap-y-11 lg:grid-cols-4">
            {products.map((product) => {
              const id = product._id || product.id;
              const saved = isSaved(id);

              const productName =
                product.name || product.title || 'Untitled creation';

              const image =
                product.image ||
                product.images?.[0]?.src ||
                product.images?.[0] ||
                '';

              return (
                <article key={id} className="group min-w-0">
                  <div className="relative overflow-hidden rounded-sm bg-[#EEE5D9]">
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${id}`)}
                      className="block w-full text-left"
                      aria-label={`View ${productName}`}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={productName}
                          loading="lazy"
                          className="aspect-[4/5] w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                            event.currentTarget.parentElement.classList.add(
                              'image-failed'
                            );
                          }}
                        />
                      ) : (
                        <div className="flex aspect-[4/5] items-center justify-center text-5xl text-[#A65D45]">
                          ✳
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(event) => handleWishlistClick(event, product)}
                      aria-label={
                        saved ? 'Remove from wishlist' : 'Add to wishlist'
                      }
                      aria-pressed={saved}
                      title={
                        saved ? 'Remove from wishlist' : 'Add to wishlist'
                      }
                      className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-[#E8DDD0] bg-[#FFFDF9]/95 shadow-sm transition hover:scale-110 hover:border-[#A65D45] focus:outline-none focus:ring-2 focus:ring-[#A65D45] sm:right-3 sm:top-3 sm:h-10 sm:w-10"
                    >
                      <span
                        className={`text-xl leading-none ${
                          saved ? 'text-[#C74D4D]' : 'text-[#69574B]'
                        }`}
                        aria-hidden="true"
                      >
                        {saved ? '♥' : '♡'}
                      </span>
                    </button>
                  </div>

                  <div className="pt-4">
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A65D45] sm:text-[11px]">
                      {product.category || 'Handmade'}
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate(`/product/${id}`)}
                      className="block w-full text-left"
                    >
                      <h3 className="line-clamp-2 text-sm font-medium leading-5 text-[#38291F] transition hover:text-[#A65D45] sm:text-base sm:leading-6">
                        {productName}
                      </h3>
                    </button>

                    {product.artisanLocation?.city && (
                      <p className="mt-1.5 text-xs text-[#857568]">
                        <span aria-hidden="true">⌖ </span>
                        {product.artisanLocation.city}
                      </p>
                    )}

                    {nearbyMode &&
                      typeof product.distanceKm === 'number' && (
                        <p className="mt-1 text-xs font-medium text-[#A65D45]">
                          {product.distanceKm.toFixed(1)} km away
                        </p>
                      )}

                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#38291F] sm:text-base">
                        {formatPrice(product.price)}
                      </p>

                      <button
                        type="button"
                        onClick={() => navigate(`/product/${id}`)}
                        className="text-xs font-medium text-[#857568] transition hover:text-[#A65D45] sm:text-sm"
                      >
                        Discover <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="mt-12 flex items-center justify-center gap-4 border-t border-[#E8DDD0] pt-7 sm:gap-6">
            <button
              type="button"
              onClick={() => {
                const nextPage = Math.max(1, page - 1);
                setPage(nextPage);

                updateUrlFilters({
                  page: nextPage === 1 ? '' : String(nextPage),
                });
              }}
              disabled={page <= 1}
              className="rounded-full border border-[#E4D8CA] px-4 py-2.5 text-xs transition hover:border-[#A65D45] disabled:cursor-not-allowed disabled:opacity-35 sm:px-5 sm:text-sm"
            >
              ← Previous
            </button>

            <span className="text-xs text-[#857568] sm:text-sm">
              Page {page}
              {totalPages !== null ? ` of ${totalPages}` : ''}
            </span>

            <button
              type="button"
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                updateUrlFilters({ page: String(nextPage) });
              }}
              disabled={!canGoNext}
              className="rounded-full border border-[#E4D8CA] px-4 py-2.5 text-xs transition hover:border-[#A65D45] disabled:cursor-not-allowed disabled:opacity-35 sm:px-5 sm:text-sm"
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
