import React from "react";

export const OrderHistory = () => {
  const orders = [
    {
      id: "#CL-1001",
      date: "August 8, 2026",
      product: "Handmade Terracotta Bowl",
      status: "Delivered",
      amount: "₹850",
    },
    {
      id: "#CL-1002",
      date: "August 5, 2026",
      product: "Handwoven Cotton Bag",
      status: "In Transit",
      amount: "₹650",
    },
    {
      id: "#CL-1003",
      date: "July 28, 2026",
      product: "Handcrafted Wooden Decor",
      status: "Delivered",
      amount: "₹1,200",
    },
  ];

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

        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-on-surface-variant">
                    Order {order.id}
                  </p>

                  <h2 className="mt-1 font-headline text-xl font-bold text-on-surface">
                    {order.product}
                  </h2>

                  <p className="mt-2 text-sm text-on-surface-variant">
                    Ordered on {order.date}
                  </p>
                </div>

                <div className="md:text-right">
                  <span
                    className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${
                      order.status === "Delivered"
                        ? "bg-secondary-container text-secondary"
                        : "bg-tertiary-fixed text-on-tertiary-fixed"
                    }`}
                  >
                    {order.status}
                  </span>

                  <p className="mt-3 text-lg font-bold text-primary">
                    {order.amount}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-10 text-center">
            <h2 className="font-headline text-xl font-bold text-on-surface">
              No orders yet
            </h2>
            <p className="mt-2 text-on-surface-variant">
              Your orders will appear here once you make a purchase.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};