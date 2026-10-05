import React, { useState } from 'react';
import AddressForm from '../../components/checkout/AddressForm';
import DeliveryMethod from '../../components/checkout/DeliveryMethod';
import PaymentSection from '../../components/checkout/PaymentSection';
import OrderSummary from '../../components/checkout/OrderSummary';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CheckoutPage() {
  const { items } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState({
    shippingAddress: {},
    deliveryMethod: 'standard',
    paymentMethod: 'card',
  });

  const handleNext = (stepData) => {
    setCheckoutData((prev) => ({ ...prev, ...stepData }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-on-surface">Your cart is empty</h1>
        <p className="mt-3 text-on-surface-variant">Add something handmade before checking out.</p>
        <Link to="/products" className="mt-6 inline-block rounded-full bg-primary px-5 py-3 text-sm font-semibold text-on-primary">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Checkout Stepper Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center space-x-4 border-b pb-4 text-sm font-medium">
          <span className={currentStep >= 1 ? 'text-blue-600 font-bold' : 'text-gray-400'}>
            1. Address
          </span>
          <span className="text-gray-300">&rarr;</span>
          <span className={currentStep >= 2 ? 'text-blue-600 font-bold' : 'text-gray-400'}>
            2. Delivery
          </span>
          <span className="text-gray-300">&rarr;</span>
          <span className={currentStep >= 3 ? 'text-blue-600 font-bold' : 'text-gray-400'}>
            3. Payment
          </span>
        </div>

        {currentStep === 1 && (
          <AddressForm onNext={handleNext} initialData={checkoutData.shippingAddress} />
        )}
        {currentStep === 2 && (
          <DeliveryMethod
            onNext={handleNext}
            onBack={handleBack}
            initialData={checkoutData.deliveryMethod}
          />
        )}
        {currentStep === 3 && (
          <PaymentSection checkoutData={checkoutData} onBack={handleBack} />
        )}
      </div>

      {/* Right Column: Dynamic Order Breakdown */}
      <div className="lg:col-span-1">
        <OrderSummary deliveryMethod={checkoutData.deliveryMethod} />
      </div>
    </div>
  );
}