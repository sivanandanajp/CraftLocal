import React, { useState } from 'react';

export default function PaymentSection({ checkoutData, onBack }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Order placed successfully!');
      console.log('Final Order Data:', { ...checkoutData, paymentMethod });
    }, 1500);
  };

  return (
    <form onSubmit={handlePlaceOrder} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <h2 className="text-xl font-semibold mb-4">3. Payment Details</h2>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {['card', 'upi', 'cod'].map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => setPaymentMethod(method)}
            className={`py-2 px-3 text-center border rounded-md font-medium text-sm capitalize ${
              paymentMethod === method ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'
            }`}
          >
            {method === 'card' ? 'Credit/Debit Card' : method.toUpperCase()}
          </button>
        ))}
      </div>

      {paymentMethod === 'card' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input
              type="text"
              required
              placeholder="4532 •••• •••• 8892"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="text"
                required
                placeholder="MM/YY"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
              <input
                type="password"
                required
                maxLength="4"
                placeholder="123"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {paymentMethod === 'upi' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
          <input
            type="text"
            required
            placeholder="username@upi"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      )}

      {paymentMethod === 'cod' && (
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
          Pay with cash or UPI directly to the delivery agent upon receiving your items.
        </p>
      )}

      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition flex items-center space-x-2"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </form>
  );
}