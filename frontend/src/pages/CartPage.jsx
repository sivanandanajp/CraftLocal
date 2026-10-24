
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ShieldCheck,
  Truck,
} from 'lucide-react';

import { useCart } from '../context/CartContext';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(price) || 0);

const CartPage = () => {
  const navigate = useNavigate();

  const {
    cartItems = [],
    updateQuantity,
    removeFromCart,
    subtotal: contextSubtotal,
    cartCount,
  } = useCart();

  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState('success');

  useEffect(() => {
    if (!notice) return undefined;

    const timer = setTimeout(() => setNotice(''), 2500);
    return () => clearTimeout(timer);
  }, [notice]);

  const showNotice = (message, type = 'success') => {
    setNotice(message);
    setNoticeType(type);
  };

  const handleQuantityChange = (item, nextQuantity) => {
    const productId = String(item._id || item.id || '');

    if (!productId) {
      showNotice('Could not identify this product.', 'error');
      return;
    }

    const stock = Number(item.stock ?? item.quantityInStock ?? 99);

    if (nextQuantity < 1) return;

    if (nextQuantity > stock) {
      showNotice(`Only ${stock} units are available.`, 'error');
      return;
    }

    try {
      updateQuantity(productId, nextQuantity);
      setNotice('');
    } catch (error) {
      showNotice(
        error.message || 'Could not update the quantity.',
        'error'
      );
    }
  };

  const handleRemove = (item) => {
    const productId = String(item._id || item.id || '');

    if (!productId) {
      showNotice('Could not identify this product.', 'error');
      return;
    }

    try {
      removeFromCart(productId);
      showNotice(`${item.name || 'Product'} removed from your cart.`);
    } catch (error) {
      showNotice(
        error.message || 'Could not remove this product.',
        'error'
      );
    }
  };

  const calculatedSubtotal = cartItems.reduce(
    (total, item) =>
      total +
      (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  const subtotal =
    Number.isFinite(Number(contextSubtotal))
      ? Number(contextSubtotal)
      : calculatedSubtotal;

  const totalItems = Number.isFinite(Number(cartCount))
    ? Number(cartCount)
    : cartItems.reduce(
        (total, item) => total + (Number(item.quantity) || 1),
        0
      );

  return (
    <main className="min-h-screen bg-[#FAF7F1] text-[#38291F]">
      {/* Page heading */}
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-[#806D60] transition hover:text-[#A65D45]"
        >
          <ArrowLeft size={17} />
          Continue shopping
        </Link>

        <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#A65D45]">
              Your selection
            </p>

            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
              Your Cart
            </h1>

            <p className="mt-3 text-[#806D60]">
              Handmade finds, thoughtfully chosen.
            </p>
          </div>

          {cartItems.length > 0 && (
            <span className="rounded-full border border-[#E8DED3] bg-white px-4 py-2 text-sm">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
      </section>

      {/* Feedback */}
      {notice && (
        <div className="mx-auto mb-5 max-w-7xl px-4 sm:px-6 lg:px-8">
          <p
            role="status"
            className={`rounded-xl border px-4 py-3 text-sm ${
              noticeType === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-green-200 bg-green-50 text-green-800'
            }`}
          >
            {notice}
          </p>
        </div>
      )}

      {/* Empty cart */}
      {cartItems.length === 0 ? (
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-[#E8DED3] bg-white px-6 py-14 text-center shadow-sm sm:py-20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F5E9DF] text-[#A65D45]">
              <ShoppingBag size={34} strokeWidth={1.5} />
            </div>

            <h2 className="mt-6 font-headline text-2xl font-bold">
              Your cart is waiting
            </h2>

            <p className="mt-3 max-w-sm leading-7 text-[#806D60]">
              Discover handmade treasures from independent artisans
              and find something special for your home or someone you love.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#A65D45] px-6 py-3 font-semibold text-white transition hover:bg-[#854832]"
            >
              Explore products
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_360px]">
            {/* Cart items */}
            <div className="space-y-4">
              {cartItems.map((item) => {
                const productId = String(item._id || item.id || '');
                const quantity = Number(item.quantity) || 1;
                const price = Number(item.price) || 0;
                const stock = Number(
                  item.stock ?? item.quantityInStock ?? 99
                );

                const image =
                  item.image ||
                  item.imageUrl ||
                  item.thumbnail ||
                  item.images?.[0] ||
                  '';

                const name =
                  item.name || item.title || 'Artisan product';

                return (
                  <article
                    key={productId}
                    className="flex flex-col gap-4 rounded-2xl border border-[#E8DED3] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5"
                  >
                    {/* Product image */}
                    <Link
                      to={`/products/${productId}`}
                      className="block h-40 w-full shrink-0 overflow-hidden rounded-xl bg-[#F5EFE7] sm:h-32 sm:w-32"
                    >
                      {image ? (
                        <img
                          src={
                            typeof image === 'string'
                              ? image
                              : image.url || image.secure_url || ''
                          }
                          alt={name}
                          className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#A65D45]">
                          <ShoppingBag size={32} />
                        </div>
                      )}
                    </Link>

                    {/* Product information */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            to={`/products/${productId}`}
                            className="font-headline text-lg font-semibold transition hover:text-[#A65D45]"
                          >
                            {name}
                          </Link>

                          {(item.category?.name || item.category) && (
                            <p className="mt-1 text-sm text-[#806D60]">
                              {typeof item.category === 'object'
                                ? item.category.name
                                : item.category}
                            </p>
                          )}

                          <p className="mt-2 font-semibold text-[#A65D45]">
                            {formatPrice(price)}
                          </p>
                        </div>

                        {/* Only one remove button */}
                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          aria-label={`Remove ${name}`}
                          title="Remove item"
                          className="rounded-lg p-2 text-[#9A8172] transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Quantity selector */}
                        <div className="flex items-center gap-3 rounded-xl border border-[#E8DED3] px-3 py-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(item, quantity - 1)
                            }
                            disabled={quantity <= 1}
                            aria-label="Decrease quantity"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6D5B50] transition hover:bg-[#F5EFE7] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="min-w-5 text-center text-sm font-semibold">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(item, quantity + 1)
                            }
                            disabled={quantity >= stock}
                            aria-label="Increase quantity"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6D5B50] transition hover:bg-[#F5EFE7] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Item total */}
                        <p className="text-sm font-semibold">
                          {formatPrice(price * quantity)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}

              <Link
                to="/products"
                className="inline-flex items-center gap-2 py-3 text-sm font-semibold text-[#A65D45] transition hover:text-[#854832]"
              >
                <ArrowLeft size={16} />
                Add more discoveries
              </Link>
            </div>

            {/* Order summary */}
            <aside className="rounded-2xl border border-[#E8DED3] bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
              <h2 className="font-headline text-xl font-bold">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[#806D60]">
                    Subtotal ({totalItems}{' '}
                    {totalItems === 1 ? 'item' : 'items'})
                  </span>
                  <span className="font-medium">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-[#806D60]">Shipping</span>
                  <span className="text-right font-medium text-[#806D60]">
                    Calculated at checkout
                  </span>
                </div>
              </div>

              <div className="my-5 border-t border-dashed border-[#E8DED3]" />

              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold">Estimated total</span>
                <span className="text-xl font-bold text-[#A65D45]">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-[#806D60]">
                Shipping charges and applicable taxes will be confirmed
                at checkout.
              </p>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#A65D45] px-5 py-3.5 font-semibold text-white transition hover:bg-[#854832]"
              >
                Continue to Checkout
                <ArrowRight size={18} />
              </button>

              <div className="mt-5 space-y-3 border-t border-[#E8DED3] pt-5">
                <div className="flex items-center gap-3 text-sm text-[#6D5B50]">
                  <Truck size={19} className="shrink-0 text-[#A65D45]" />
                  <span>Shipping details confirmed at checkout</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-[#6D5B50]">
                  <ShieldCheck
                    size={19}
                    className="shrink-0 text-[#A65D45]"
                  />
                  <span>Secure checkout experience</span>
                </div>
              </div>
            </aside>
          </div>
        </section>
      )}
    </main>
  );
};

export default CartPage;
