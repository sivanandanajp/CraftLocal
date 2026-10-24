
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  Search,
  Package,
  RefreshCw,
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/products';
const PRODUCTS_PER_REQUEST = 100;

const CATEGORY_IMAGES = {
  'jewelry & accessories':
    'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=85',
};

const CATEGORY_DETAILS = {
  'home & decor': {
    description: 'Artisan accents that make a space feel like home.',
    accent: 'bg-emerald-100 text-emerald-800',
  },
  'jewelry & accessories': {
    description:
      'Distinctive handmade jewelry and accessories with a personal touch.',
    accent: 'bg-purple-100 text-purple-800',
  },
  'handmade & lifestyle': {
    description: 'Thoughtful handmade essentials for everyday living.',
    accent: 'bg-rose-100 text-rose-800',
  },
  'kitchen & dining': {
    description: 'Useful, beautiful essentials for your kitchen and table.',
    accent: 'bg-sky-100 text-sky-800',
  },
  'art & gifts': {
    description:
      'Creative treasures and thoughtful gifts made with meaning.',
    accent: 'bg-amber-100 text-amber-900',
  },

  // Existing categories are also supported.
  pottery: {
    description: 'Handcrafted ceramics made for everyday rituals.',
    accent: 'bg-orange-100 text-orange-800',
  },
  textiles: {
    description: 'Thoughtful fabrics, woven textures, and handmade comforts.',
    accent: 'bg-rose-100 text-rose-800',
  },
  woodwork: {
    description: 'Natural wood creations with character and warmth.',
    accent: 'bg-amber-100 text-amber-900',
  },
  jewelry: {
    description: 'Distinctive handmade pieces with a personal touch.',
    accent: 'bg-purple-100 text-purple-800',
  },
  'home decor': {
    description: 'Artisan accents that make a space feel like home.',
    accent: 'bg-emerald-100 text-emerald-800',
  },
  kitchenware: {
    description: 'Useful, beautiful essentials for your kitchen.',
    accent: 'bg-sky-100 text-sky-800',
  },
};

const getCategoryDetails = (name) =>
  CATEGORY_DETAILS[name.trim().toLowerCase()] || {
    description: `Explore handcrafted ${name.toLowerCase()} from our makers.`,
    accent: 'bg-stone-100 text-stone-800',
  };

export default function CategoriesPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAllProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const firstParams = new URLSearchParams({
          page: '1',
          limit: String(PRODUCTS_PER_REQUEST),
        });

        const firstResponse = await fetch(
          `${API_URL}?${firstParams.toString()}`,
          { signal: controller.signal }
        );

        const firstData = await firstResponse.json();

        if (!firstResponse.ok) {
          throw new Error(
            firstData.message || 'Could not load categories.'
          );
        }

        let allProducts = Array.isArray(firstData)
          ? firstData
          : Array.isArray(firstData.products)
            ? firstData.products
            : Array.isArray(firstData.data)
              ? firstData.data
              : [];

        const totalPages = Array.isArray(firstData)
          ? 1
          : Math.max(1, Number(firstData.totalPages) || 1);

        for (let currentPage = 2; currentPage <= totalPages; currentPage += 1) {
          const params = new URLSearchParams({
            page: String(currentPage),
            limit: String(PRODUCTS_PER_REQUEST),
          });

          const response = await fetch(
            `${API_URL}?${params.toString()}`,
            { signal: controller.signal }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || 'Could not load all products.'
            );
          }

          const pageProducts = Array.isArray(data)
            ? data
            : Array.isArray(data.products)
              ? data.products
              : Array.isArray(data.data)
                ? data.data
                : [];

          allProducts = allProducts.concat(pageProducts);
        }

        if (!controller.signal.aborted) {
          setProducts(allProducts);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(
            err.message || 'Unable to connect to the product server.'
          );
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAllProducts();

    return () => controller.abort();
  }, [retryKey]);

  const categories = useMemo(() => {
    const grouped = new Map();

    products.forEach((product) => {
      const name = String(product.category || '').trim();

      if (!name) return;

      const key = name.toLowerCase();

      if (!grouped.has(key)) {
        grouped.set(key, {
          name,
          count: 0,
          image: '',
        });
      }

      const category = grouped.get(key);
      category.count += 1;

      if (!category.image && product.image) {
        category.image = product.image;
      }
    });

    // Override the image for categories with a dedicated image.
    grouped.forEach((category, key) => {
      if (CATEGORY_IMAGES[key]) {
        category.image = CATEGORY_IMAGES[key];
      }
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [products]);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const openCategory = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#29251f]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] bg-[#eee4d6] px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#d5a18e]/30 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-[#d8c5a4]/40 blur-2xl" />

          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#b66a4b]/25 bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#a54d2d]">
              <Compass size={15} />
              Explore CraftLocal
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Find something
              <span className="block font-medium italic text-[#a54d2d]">
                made with meaning.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#65584b] sm:text-base">
              Discover handmade treasures, thoughtful details, and
              one-of-a-kind creations from our artisan marketplace.
            </p>

            <a
              href="#categories"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#a54d2d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#873b23]"
            >
              Explore categories
              <ArrowRight size={17} />
            </a>
          </div>
        </section>

        {/* Category heading and search */}
        <section id="categories" className="scroll-mt-8 pt-12 sm:pt-16">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a54d2d]">
                Curated for you
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Browse by category
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#756b60]">
                Explore the real collections available in our shop.
              </p>
            </div>

            <label className="relative block w-full sm:max-w-xs">
              <span className="sr-only">Search categories</span>
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8d8277]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find a category..."
                className="w-full rounded-full border border-[#e4d9cd] bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#a69a8e] focus:border-[#b76a4c] focus:ring-2 focus:ring-[#b76a4c]/15"
              />
            </label>
          </div>

          {loading && (
            <div
              className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              aria-label="Loading categories"
              aria-busy="true"
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-3xl bg-white"
                >
                  <div className="h-56 bg-[#e8ded2]" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-2/3 rounded bg-[#e8ded2]" />
                    <div className="h-3 w-full rounded bg-[#eee7df]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div
              role="alert"
              className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6"
            >
              <h3 className="font-semibold text-red-800">
                We couldn't load your categories
              </h3>

              <p className="mt-2 text-sm text-red-700">{error}</p>

              <button
                type="button"
                onClick={() => setRetryKey((current) => current + 1)}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
              >
                <RefreshCw size={15} />
                Try again
              </button>
            </div>
          )}

          {!loading && !error && filteredCategories.length > 0 && (
            <>
              <p className="mt-6 text-xs text-[#81766a]">
                {filteredCategories.length}{' '}
                {filteredCategories.length === 1 ? 'category' : 'categories'}
                {' · '}
                {products.length} products loaded
              </p>

              <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCategories.map((category) => {
                  const details = getCategoryDetails(category.name);

                  return (
                    <button
                      key={category.name.toLowerCase()}
                      type="button"
                      onClick={() => openCategory(category.name)}
                      className="group overflow-hidden rounded-3xl border border-[#eadfd4] bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#d6b09b] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#a54d2d] focus:ring-offset-2"
                      aria-label={`Browse ${category.name}, ${category.count} products`}
                    >
                      <div className="relative h-56 overflow-hidden bg-[#eee5da] sm:h-64">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package
                              size={42}
                              className="text-[#b9a594]"
                            />
                          </div>
                        )}

                        <span
                          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold ${details.accent}`}
                        >
                          {category.count}{' '}
                          {category.count === 1 ? 'product' : 'products'}
                        </span>

                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
                      </div>

                      <div className="flex items-end justify-between gap-4 p-5 sm:p-6">
                        <div>
                          <h3 className="text-xl font-bold tracking-tight text-[#29251f]">
                            {category.name}
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-[#756b60]">
                            {details.description}
                          </p>
                        </div>

                        <span className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f6eee6] text-[#a54d2d] transition group-hover:bg-[#a54d2d] group-hover:text-white">
                          <ArrowRight size={18} />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {!loading && !error && filteredCategories.length === 0 && (
            <div className="mt-8 rounded-3xl border border-dashed border-[#ddcdbd] bg-white/70 px-6 py-14 text-center">
              <Compass size={36} className="mx-auto text-[#b8a18d]" />

              <h3 className="mt-4 text-lg font-semibold">
                {search ? 'No matching categories' : 'No categories yet'}
              </h3>

              <p className="mt-2 text-sm text-[#756b60]">
                {search
                  ? 'Try another search term.'
                  : 'Once products are available, their categories will appear here.'}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="mt-4 text-sm font-semibold text-[#a54d2d] hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
