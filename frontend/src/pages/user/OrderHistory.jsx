import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useOrders } from "../../context/OrderContext";

export const OrderHistory = () => {
  const { orders } = useOrders();
  const location = useLocation();
  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <h1 className="font-headline text-4xl font-bold text-on-surface">
            Order History
          </h1>
          <p className="mt-2 text-on-surface-variant">
            View your previous and current orders.
          </p>
        </div>

        {location.state?.placedOrderId && (
          <div role="status" className="mb-6 border-l-4 border-secondary bg-secondary-container/30 px-4 py-3 text-sm font-semibold text-on-surface">
            Order {location.state.placedOrderId} was placed successfully.
          </div>
        )}

        {orders.length > 0 ? (
          <div className="divide-y divide-outline-variant border-y border-outline-variant">
            {orders.map((order) => (
              <article key={order.id} className="py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-on-surface-variant">Order {order.id}</p>
                    <h2 className="mt-1 font-headline text-xl font-bold text-on-surface">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </h2>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      Placed {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-full bg-tertiary-fixed px-3 py-1.5 text-sm font-semibold text-on-tertiary-fixed">
                      {order.status}
                    </span>
                    <p className="mt-2 text-lg font-bold text-primary">{currency.format(order.total)}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img src={item.image} alt="" className="h-14 w-14 rounded-md bg-surface-container object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-on-surface">{item.title}</p>
                        <p className="text-sm text-on-surface-variant">Qty {item.quantity} · {currency.format(item.price)} each</p>
                      </div>
                      <p className="font-semibold text-on-surface">{currency.format(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-1 border-t border-outline-variant pt-3 text-sm text-on-surface-variant sm:grid-cols-2">
                  <p>Delivery: {order.deliveryMethod}</p>
                  <p>Payment: {order.paymentMethod.toUpperCase()}</p>
                  <p className="sm:col-span-2">Ship to: {order.shippingAddress.fullName}, {order.shippingAddress.addressLine}, {order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border-y border-outline-variant py-12 text-center">
            <h2 className="font-headline text-xl font-bold text-on-surface">
              No orders yet
            </h2>
            <p className="mt-2 text-on-surface-variant">
              Your orders will appear here once you make a purchase.
            </p>
            <Link to="/products" className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary">
              Browse products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};