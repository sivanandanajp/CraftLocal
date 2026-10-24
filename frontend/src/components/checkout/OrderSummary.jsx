
import React from 'react';
import { useCart } from '../../context/CartContext';
import formatPrice from '../../utils/formatPrice';

const roundMoney = (amount) =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

export default function OrderSummary({
  deliveryMethod = 'standard',
}) {
  const { cartItems, subtotal } = useCart();

  const safeSubtotal = roundMoney(Number(subtotal || 0));

  const shippingFee =
    cartItems.length === 0
      ? 0
      : deliveryMethod === 'express'
        ? 15
        : 5;

  const tax = roundMoney(safeSubtotal * 0.08);

  const grandTotal = roundMoney(
    safeSubtotal + shippingFee + tax
  );

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="border-b border-gray-200 pb-3 text-xl font-semibold text-gray-900">
        Order Summary
      </h2>

      {cartItems.length === 0 ? (
        <p className="text-sm text-gray-500">
          Your cart is empty.
        </p>
      ) : (
        <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-3 text-sm"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-14 w-14 rounded-md bg-gray-100 object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-400">
                  No image
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-800">
                  {item.name}
                </p>

                <p className="text-gray-500">
                  Qty: {item.quantity}
                </p>
              </div>

              <p className="whitespace-nowrap font-semibold text-gray-700">
                {formatPrice(
                  Number(item.price) * Number(item.quantity)
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      <hr className="border-gray-200" />

      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex justify-between gap-3">
          <span>Subtotal</span>
          <span>{formatPrice(safeSubtotal)}</span>
        </div>

        <div className="flex justify-between gap-3">
          <span>
            Shipping (
            {deliveryMethod === 'express' ? 'Express' : 'Standard'})
          </span>
          <span>{formatPrice(shippingFee)}</span>
        </div>

        <div className="flex justify-between gap-3">
          <span>Estimated Tax (8%)</span>
          <span>{formatPrice(tax)}</span>
        </div>

        <hr className="border-gray-200" />

        <div className="flex justify-between gap-3 text-base font-bold text-gray-900">
          <span>Total</span>
          <span className="text-[#A65D45]">
            {formatPrice(grandTotal)}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        The final order total is recalculated using product prices stored
        in the backend.
      </p>
    </div>
  );
}
