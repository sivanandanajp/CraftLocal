
import React, { useState } from 'react';
import { formatPrice } from '../../utils/formatPrice';

export default function DeliveryMethod({
  onNext,
  onBack,
  initialData = 'standard',
}) {
  const [selectedMethod, setSelectedMethod] = useState(initialData);

  const options = [
    {
      id: 'standard',
      title: 'Standard Shipping',
      time: '3–5 Business Days',
      price: 5,
    },
    {
      id: 'express',
      title: 'Express Delivery',
      time: '1–2 Business Days',
      price: 15,
    },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    onNext({ deliveryMethod: selectedMethod });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-4 text-xl font-semibold">
        2. Select Delivery Option
      </h2>

      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.id}
            className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition ${
              selectedMethod === option.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="delivery"
                value={option.id}
                checked={selectedMethod === option.id}
                onChange={() => setSelectedMethod(option.id)}
                className="text-blue-600 focus:ring-blue-500"
              />

              <div>
                <div className="font-medium text-gray-900">
                  {option.title}
                </div>
                <div className="text-sm text-gray-500">
                  {option.time}
                </div>
              </div>
            </div>

            <span className="font-semibold text-gray-700">
              {formatPrice(option.price)}
            </span>
          </label>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-gray-300 px-6 py-2 text-gray-700 transition hover:bg-gray-50"
        >
          Back
        </button>

        <button
          type="submit"
          className="rounded-md bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
        >
          Continue to Payment
        </button>
      </div>
    </form>
  );
}
