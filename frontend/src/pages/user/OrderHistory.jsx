
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  CalendarDays,
  MapPin,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';

import API from '../../services/api';
import formatPrice from '../../utils/formatPrice';

const formatDate = (date) => {
  if (!date) return 'Date unavailable';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date unavailable';
  }

  return parsedDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getStatusStyle = (status) => {
  switch (String(status || 'Pending').toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-amber-100 text-amber-800';
  }
};

const getPaymentLabel = (method) => {
  const labels = {
    card: 'Credit / Debit Card',
    upi: 'UPI',
    cod: 'Cash on Delivery',
  };

  return labels[String(method || '').toLowerCase()] || 'Not specified';
};

const getOrderList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.data)) return payload.data;
  return null;
};

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await API.get('/orders/my-orders');
      const fetchedOrders = getOrderList(response?.data);

      if (fetchedOrders === null) {
        throw new Error('The server response did not contain an order list.');
      }

      // Show newest orders first.
      const sortedOrders = [...fetchedOrders].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );

      setOrders(sortedOrders);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          (error.response?.status === 401
            ? 'Please sign in again to view your order history.'
            : error.message) ||
          'Unable to load your orders. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    // Refresh when the user returns to this browser tab.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchOrders();
      }
    };

    window.addEventListener('focus', fetchOrders);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', fetchOrders);
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, [fetchOrders]);

  return (
    <main className="min-h-screen bg-[#FAF7F1] px-4 py-8 text-[#38291F] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/profile"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#8F4D39] transition hover:text-[#713B2B]"
        >
          <ArrowLeft size={17} />
          Back to Profile
        </Link>

        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#A65D45]">
            Your CraftLocal account
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Order History
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#78685D] sm:text-base">
            View your purchases and check the status of your orders.
          </p>
        </header>

        {loading && (
          <section
            aria-live="polite"
            className="rounded-2xl border border-[#E9DED3] bg-white p-12 text-center shadow-sm"
          >
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-[#E9DED3] border-t-[#A65D45]" />
            <p className="text-sm text-[#78685D]">
              Loading your orders...
            </p>
          </section>
        )}

        {!loading && errorMessage && (
          <section
            role="alert"
            className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm"
          >
            <Package
              className="mx-auto mb-3 text-rose-500"
              size={36}
            />

            <h2 className="text-lg font-semibold">
              Could not load your orders
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#78685D]">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={fetchOrders}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#A65D45] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8F4D39]"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </section>
        )}

        {!loading && !errorMessage && orders.length === 0 && (
          <section className="rounded-2xl border border-[#E9DED3] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4E8E1]">
              <ShoppingBag size={30} className="text-[#A65D45]" />
            </div>

            <h2 className="mt-5 text-xl font-bold">No orders yet</h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#78685D]">
              Your purchases will appear here after you place your first
              order. Discover handmade products from CraftLocal sellers.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#A65D45] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8F4D39]"
            >
              Explore Products
            </Link>
          </section>
        )}

        {!loading && !errorMessage && orders.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#78685D]">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
              </p>

              <button
                type="button"
                onClick={fetchOrders}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#8F4D39] transition hover:underline"
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>

            {orders.map((order, orderIndex) => {
              const orderId =
                order._id || order.id || `order-${orderIndex}`;
              const items = Array.isArray(order.items) ? order.items : [];
              const address = order.shippingAddress || {};

              return (
                <article
                  key={orderId}
                  className="overflow-hidden rounded-2xl border border-[#E9DED3] bg-white shadow-[0_8px_28px_rgba(56,41,31,0.04)]"
                >
                  <div className="flex flex-col gap-4 border-b border-[#EFE5DC] bg-[#FFFDF9] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#8A7B70]">
                        Order ID
                      </p>

                      <p className="mt-1 break-all text-sm font-bold">
                        #{String(orderId).slice(-8).toUpperCase()}
                      </p>

                      <p className="mt-2 flex items-center gap-2 text-sm text-[#78685D]">
                        <CalendarDays size={15} />
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(order.status)}`}
                      >
                        {order.status || 'Pending'}
                      </span>

                      <p className="text-xl font-bold">
                        {formatPrice(order.totalAmount ?? order.total ?? 0)}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <h2 className="mb-4 flex items-center gap-2 font-semibold">
                      <ShoppingBag size={18} className="text-[#A65D45]" />
                      Items in this order ({items.length})
                    </h2>

                    {items.length > 0 ? (
                      <div className="space-y-4">
                        {items.map((item, index) => (
                          <div
                            key={
                              item._id ||
                              item.productId ||
                              `${orderId}-${index}`
                            }
                            className="flex items-start gap-4"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name || 'Ordered product'}
                                className="h-20 w-20 shrink-0 rounded-xl border border-[#EFE5DC] bg-[#FAF7F1] object-cover"
                              />
                            ) : (
                              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#F4E8E1]">
                                <Package
                                  size={28}
                                  className="text-[#A65D45]"
                                />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="font-semibold">
                                {item.name || item.product?.name || 'Craft item'}
                              </p>

                              <p className="mt-1 text-sm text-[#78685D]">
                                Quantity: {item.quantity || 1}
                              </p>

                              <p className="mt-1 text-sm text-[#78685D]">
                                {formatPrice(item.price || 0)} each
                              </p>
                            </div>

                            <p className="shrink-0 text-sm font-bold">
                              {formatPrice(
                                Number(item.price || 0) *
                                  Number(item.quantity || 1)
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#78685D]">
                        No item details are available for this order.
                      </p>
                    )}
                  </div>

                  <div className="grid gap-6 border-t border-[#EFE5DC] p-5 sm:grid-cols-2 sm:p-6">
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                        <MapPin size={17} className="text-[#A65D45]" />
                        Delivery Address
                      </h3>

                      {address.fullName || address.address || address.city ? (
                        <div className="space-y-1 text-sm leading-5 text-[#78685D]">
                          {address.fullName && (
                            <p className="font-medium text-[#38291F]">
                              {address.fullName}
                            </p>
                          )}

                          {address.address && <p>{address.address}</p>}

                          <p>
                            {[address.city, address.state]
                              .filter(Boolean)
                              .join(', ')}
                          </p>

                          {address.postalCode && <p>{address.postalCode}</p>}
                          {address.phone && <p>{address.phone}</p>}
                        </div>
                      ) : (
                        <p className="text-sm text-[#78685D]">
                          Address unavailable
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-3 text-sm font-bold">
                        Order Summary
                      </h3>

                      <div className="space-y-2 text-sm text-[#78685D]">
                        <div className="flex justify-between gap-3">
                          <span>Subtotal</span>
                          <span>{formatPrice(order.subtotal ?? 0)}</span>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span>Shipping</span>
                          <span>{formatPrice(order.shippingFee ?? 0)}</span>
                        </div>

                        <div className="flex justify-between gap-3">
                          <span>Tax</span>
                          <span>{formatPrice(order.tax ?? 0)}</span>
                        </div>

                        <div className="flex justify-between gap-3 border-t border-[#EFE5DC] pt-3 font-bold text-[#38291F]">
                          <span>Total</span>
                          <span>
                            {formatPrice(order.totalAmount ?? order.total ?? 0)}
                          </span>
                        </div>

                        <p className="pt-2">
                          <span className="font-semibold text-[#38291F]">
                            Payment:{' '}
                          </span>
                          {getPaymentLabel(order.paymentMethod)}
                        </p>

                        <p>
                          <span className="font-semibold text-[#38291F]">
                            Payment Status:{' '}
                          </span>
                          {order.paymentStatus ||
                            (order.paymentMethod === 'cod'
                              ? 'Pending'
                              : 'Not available')}
                        </p>

                        <p>
                          <span className="font-semibold text-[#38291F]">
                            Delivery:{' '}
                          </span>
                          {order.deliveryMethod === 'express'
                            ? 'Express'
                            : 'Standard'}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
};

export default OrderHistory;
