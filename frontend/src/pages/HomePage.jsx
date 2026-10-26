import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

const API_URL = 'https://craftlocal-backend.onrender.com/api/products';

const getProductId = (product) => product._id || product.id;

const getProductName = (product) =>
  product.name || product.title || product.productName || 'Handcrafted piece';

const getProductImage = (product) => {
  const image =
    product.image ||
    product.imageUrl ||
    product.thumbnail ||
    product.images?.[0];

  if (typeof image === 'string') return image;

  if (image && typeof image === 'object') {
    return image.url || image.secure_url || image.src || '';
  }

  return '';
};

const formatPrice = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'Price unavailable';
  }

  const number = Number(value);

  if (Number.isNaN(number)) return String(value);

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(number);
};

function SectionHeading({ eyebrow, title, description, link, linkLabel }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-5 sm:mb-9">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#A65D45] sm:text-[11px]">
          {eyebrow}
        </p>

        <h2 className="mt-2 font-headline text-3xl font-medium leading-tight tracking-[-0.035em] text-[#38291F] sm:text-4xl">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-lg text-xs leading-6 text-[#827366] sm:text-sm">
            {description}
          </p>
        )}
      </div>

      {link && (
        <NavLink
          to={link}
          className="hidden shrink-0 items-center gap-2 pb-1 text-xs font-medium text-[#8E4B35] transition hover:gap-3 sm:inline-flex"
        >
          {linkLabel || 'Explore all'}
          <span aria-hidden="true">↗</span>
        </NavLink>
      )}
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMarketplace() {
      try {
        setLoading(true);
        setLoadError(false);

        const firstResponse = await fetch(
          `${API_URL}?page=1&limit=100`,
          { signal: controller.signal }
        );

        const firstData = await firstResponse.json();

        if (!firstResponse.ok) {
          throw new Error(
            firstData.message || 'Could not load marketplace products.'
          );
        }

        let allProducts = Array.isArray(firstData)
          ? firstData
          : firstData.products || firstData.data || [];

        if (!Array.isArray(firstData)) {
          const totalPages = Math.max(
            1,
            Number(firstData.totalPages) || 1
          );

          for (let page = 2; page <= totalPages; page += 1) {
            const response = await fetch(
              `${API_URL}?page=${page}&limit=100`,
              { signal: controller.signal }
            );

            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data.message || 'Could not load the complete catalog.'
              );
            }

            allProducts = allProducts.concat(
              Array.isArray(data) ? data : data.products || data.data || []
            );
          }
        }

        if (controller.signal.aborted) return;

        setProducts(allProducts.slice(0, 4));
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Homepage marketplace loading failed:', error);
          setLoadError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadMarketplace();

    return () => controller.abort();
  }, []);

  return (
    <main className="overflow-hidden bg-[#FAF7F1] text-[#38291F]">
      {/* HERO */}
      <section className="px-4 pb-8 pt-5 sm:px-7 sm:pb-12 sm:pt-7 lg:px-12 lg:pt-9">
        <div className="mx-auto grid max-w-[1380px] overflow-hidden border border-[#E8DCCB] bg-[#F0E6D8] md:grid-cols-[0.92fr_1.08fr]">
          <div className="flex flex-col items-start justify-center px-6 py-11 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
            <div className="flex items-center gap-3">
              <span className="h-px w-7 bg-[#A65D45]" />

              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#92553D] sm:text-[11px]">
                Handmade goods · Meaningful finds
              </p>
            </div>

            <h1 className="mt-6 max-w-xl font-headline text-[42px] font-medium leading-[1.08] tracking-[-0.055em] text-[#38271D] sm:text-5xl lg:text-[64px]">
              A little more
              <br />
              meaning in
              <br />
              <span className="font-normal italic text-[#A65D45]">
                the everyday.
              </span>
            </h1>

            <p className="mt-6 max-w-[390px] text-sm leading-7 text-[#766657] sm:text-[15px]">
              Discover beautifully made objects, shaped by skilled hands and
              inspired by tradition. Pieces to live with, love, and keep.
            </p>

            <div className="mt-8">
              <NavLink
                to="/products"
                className="group inline-flex items-center gap-4 bg-[#A65D45] px-6 py-3.5 text-xs font-medium tracking-wide text-white transition duration-300 hover:bg-[#874832]"
              >
                Explore the collection
                <span
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </NavLink>
            </div>
          </div>

          <div className="relative min-h-[280px] overflow-hidden sm:min-h-[360px] md:min-h-[470px]">
            <img
              src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1600&q=90"
              alt="Handcrafted ceramic objects"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="px-4 py-9 sm:px-7 sm:py-12 lg:px-12 lg:py-14">
        <div className="mx-auto max-w-[1280px]">
          <SectionHeading
            eyebrow="A considered edit"
            title="Made by independent hands."
            description="Small-batch finds and everyday objects with a story to tell."
            link="/products"
            linkLabel="View all products"
          />

          {!loading && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4">
              {products.map((product, index) => {
                const id = getProductId(product);
                const name = getProductName(product);
                const image = getProductImage(product);
                const price = product.price ?? product.sellingPrice;

                const maker =
                  product.artisan?.name ||
                  product.seller?.name ||
                  product.makerName ||
                  product.brand ||
                  '';

                return (
                  <article
                    key={id || `${name}-${index}`}
                    className="group min-w-0"
                  >
                    <NavLink
                      to={id ? `/product/${id}` : '/products'}
                      className="block"
                    >
                      <div className="relative overflow-hidden bg-[#EEE5D9]">
                        <div className="aspect-[0.92/1] overflow-hidden">
                          {image ? (
                            <img
                              src={image}
                              alt={name}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center font-headline text-4xl italic text-[#A65D45]">
                              Craft
                            </div>
                          )}
                        </div>

                        <span className="absolute left-2 top-2 bg-[#FAF7F1]/90 px-2 py-1.5 text-[8px] uppercase tracking-[0.15em] text-[#73533D] sm:left-3 sm:top-3 sm:text-[9px]">
                          Artisan made
                        </span>
                      </div>

                      <div className="pt-3 sm:pt-4">
                        <h3 className="line-clamp-2 min-h-10 font-headline text-sm font-medium leading-5 text-[#38291F] transition group-hover:text-[#A65D45] sm:text-base">
                          {name}
                        </h3>

                        <p className="mt-1.5 text-xs font-medium tracking-wide text-[#674532] sm:text-sm">
                          {formatPrice(price)}
                        </p>

                        {maker && (
                          <p className="mt-2 truncate text-[10px] text-[#918173] sm:text-xs">
                            Crafted by {maker}
                          </p>
                        )}
                      </div>
                    </NavLink>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="border-y border-[#E6DCCE] py-10 text-center">
              <p className="font-headline text-xl text-[#38291F]">
                {loadError
                  ? 'Our collection will be back shortly.'
                  : loading
                    ? 'Discovering the collection…'
                    : 'Something lovely is waiting to be found.'}
              </p>

              <NavLink
                to="/products"
                className="mt-5 inline-flex border-b border-[#A65D45] pb-1 text-xs font-medium text-[#A65D45]"
              >
                Explore the shop →
              </NavLink>
            </div>
          )}
        </div>
      </section>

      {/* ARTISAN STORY */}
      <section className="px-4 pb-12 pt-5 sm:px-7 sm:pb-16 lg:px-12">
        <div className="mx-auto grid max-w-[1280px] overflow-hidden bg-[#EDE5D9] md:grid-cols-2">
          <div className="relative min-h-[250px] overflow-hidden sm:min-h-[330px]">
            <img
              src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1100&q=85"
              alt="An artisan working on handmade ceramics"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col items-start justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#A65D45]">
              Behind every piece
            </p>

            <h2 className="mt-5 max-w-md font-headline text-3xl font-medium leading-[1.15] tracking-[-0.04em] text-[#38291F] sm:text-4xl lg:text-[46px]">
              Good things take a human touch.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#766657]">
              Behind every thoughtful object is a person, a skill, and a
              story worth preserving. We bring independent makers closer to
              the people who appreciate their work.
            </p>

            <NavLink
              to="/categories"
              className="group mt-7 inline-flex items-center gap-4 border-b border-[#A65D45] pb-2 text-xs font-medium text-[#8E4B35]"
            >
              Discover the makers
              <span
                className="transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </NavLink>
          </div>
        </div>
      </section>

      {/* CLOSING BRAND STATEMENT */}
      <section className="px-4 pb-12 sm:px-7 lg:px-12">
        <div className="mx-auto max-w-[1280px] border-t border-[#E5D9CA] py-8 text-center sm:py-10">
          <p className="font-headline text-2xl italic text-[#A65D45] sm:text-3xl">
            Fewer things. Better stories.
          </p>

          <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-[#827366]">
            Discover the beauty of handmade goods.
          </p>
        </div>
      </section>
    </main>
  );
}