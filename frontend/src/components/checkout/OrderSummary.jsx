import React from 'react';

export default function OrderSummary({ deliveryMethod = 'standard' }) {
  // Sample Cart Data
  const items = [
    { id: 1, name: 'Wireless Headphones', price: 99.0, quantity: 1 },
    { id: 2, name: 'Ergonomic Mouse', price: 49.0, quantity: 2 },
  ];

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = deliveryMethod === 'express' ? 15.0 : 5.0;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shippingFee + tax;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <h2 className="text-xl font-semibold border-b pb-3">Order Summary</h2>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div>
              <p className="font-medium text-gray-800">{item.name}</p>
              <p className="text-gray-500">Qty: {item.quantity}</p>
            </div>
            <p className="font-semibold text-gray-700">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <hr className="border-gray-200" />

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping ({deliveryMethod})</span>
          <span>${shippingFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <hr className="border-gray-200 my-2" />
        <div className="flex justify-between font-bold text-base text-gray-900">
          <span>Total</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}