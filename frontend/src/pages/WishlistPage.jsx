
import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import formatPrice from '../utils/formatPrice';

const getProductImage = (item) => {
  if (typeof item.image === 'string') return item.image;
  return item.image?.url || item.image?.src || '';
};

const getCategoryName = (category) => {
  if (typeof category === 'string') return category;
  return category?.name || category?.title || 'Handcrafted';
};

const WishlistPage = () => {
  const { items, removeItem } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item) => {
    if (!Number.isInteger(item.stock) || item.stock < 1) {
      window.alert(
        'Stock information is unavailable for this product. Please open the product page to check availability.'
      );
      return;
    }

    try {
      addToCart(
        {
          _id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          category: item.category,
          description: item.description || '',
          stock: item.stock,
        },
        1
      );

      window.alert('Product added to your cart!');
    } catch (error) {
      window.alert(
        error.message || 'Unable to add this product to your cart.'
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7F1] px-4 py-10 text-[#38291F] sm:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-10">
          <p className="mb-3 text-sm uppercase tracking-[0.25em] text-[#A65D45]">
            Your personal collection
          </p>

          <h1 className="font-headline text-4xl sm:text-5xl">
            My Wishlist
          </h1>

          <p className="mt-3 text-sm text-[#38291F]/70 sm:text-base">
            Keep the handmade pieces you love in one place.
          </p>

          <div className="mt-5 h-px w-full bg-[#38291F]/15" />
        </div>

        {/* Empty wishlist */}
        {items.length === 0 ? (
          <section className="flex min-h-[350px] flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#A65D45]/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
              </svg>
            </div>

            <h2 className="font-headline text-2xl sm:text-3xl">
              Your wishlist is waiting
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-[#38291F]/70">
              You haven&apos;t saved any products yet. Explore unique
              handmade pieces and tap the heart to keep your favourites here.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex items-center justify-center bg-[#A65D45] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#874833]"
            >
              Explore Products
            </Link>
          </section>
        ) : (
          <>
            {/* Wishlist count and clear action */}
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm text-[#38291F]/70">
                {items.length} saved {items.length === 1 ? 'piece' : 'pieces'}
              </p>

              <Link
                to="/products"
                className="text-sm font-medium text-[#A65D45] underline underline-offset-4 hover:text-[#874833]"
              >
                Continue exploring
              </Link>
            </div>

            {/* Wishlist products */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => {
                const image = getProductImage(item);
                const category = getCategoryName(item.category);

                return (
                  <article key={item.id} className="group min-w-0">
                    <div className="relative overflow-hidden bg-[#EDE5D9]">
                      <Link
                        to={`/product/${item.id}`}
                        aria-label={`View ${item.name}`}
                        className="block"
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={item.name}
                            className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex aspect-[4/5] w-full items-center justify-center px-4 text-center text-sm text-[#38291F]/50">
                            Product image unavailable
                          </div>
                        )}
                      </Link>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name} from wishlist`}
                        title="Remove from wishlist"
                        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF7F1] text-[#A65D45] shadow-sm transition hover:bg-[#A65D45] hover:text-white"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="m19 6-1 14H6L5 6" />
                          <path d="M10 11v5M14 11v5" />
                        </svg>
                      </button>
                    </div>

                    <div className="pt-4">
                      <p className="mb-2 text-xs uppercase tracking-[0.15em] text-[#A65D45]">
                        {category}
                      </p>

                      <Link
                        to={`/product/${item.id}`}
                        className="block font-headline text-xl transition hover:text-[#A65D45]"
                      >
                        {item.name}
                      </Link>

                      <p className="mt-2 text-base font-medium">
                        {formatPrice(item.price)}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="mt-4 w-full border border-[#38291F] px-4 py-3 text-sm font-medium transition hover:bg-[#38291F] hover:text-white"
                      >
                        Add to Cart
                      </button>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="mt-3 w-full py-2 text-sm text-[#38291F]/65 underline underline-offset-4 transition hover:text-[#A65D45]"
                      >
                        Remove from Wishlist
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default WishlistPage;
