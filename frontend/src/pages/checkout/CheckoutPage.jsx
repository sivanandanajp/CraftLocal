
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, CheckCircle } from 'lucide-react';

import AddressForm from '../../components/checkout/AddressForm';
import DeliveryMethod from '../../components/checkout/DeliveryMethod';
import PaymentSection from '../../components/checkout/PaymentSection';
import OrderSummary from '../../components/checkout/OrderSummary';
import { useCart } from '../../context/CartContext';

const roundMoney = (amount) =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

export default function CheckoutPage() {
  const { cartItems, subtotal } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [checkoutData, setCheckoutData] = useState({
    shippingAddress: {},
    deliveryMethod: 'standard',
    paymentMethod: 'cod',
  });
  const [validationError, setValidationError] = useState('');

  const validateAddress = (address) => {
    if (!address || typeof address !== 'object') {
      return 'Please enter your delivery address.';
    }

    const requiredFields = [
      ['fullName', 'Full name'],
      ['email', 'Email'],
      ['phone', 'Phone number'],
      ['address', 'Street address'],
      ['city', 'City'],
      ['state', 'State'],
      ['postalCode', 'Postal code'],
    ];

    for (const [field, label] of requiredFields) {
      if (!String(address[field] ?? '').trim()) {
        return `Please enter your ${label.toLowerCase()}.`;
      }
    }

    const email = String(address.email).trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address.';
    }

    const phone = String(address.phone).replace(/[\s()-]/g, '');

    if (!/^\+?\d{8,15}$/.test(phone)) {
      return 'Please enter a valid phone number.';
    }

    const postalCode = String(address.postalCode).trim();

    if (!/^[A-Za-z0-9 -]{3,10}$/.test(postalCode)) {
      return 'Please enter a valid postal code.';
    }

    return '';
  };

  const handleNext = (stepData) => {
    setValidationError('');

    if (currentStep === 1) {
      const address = stepData?.shippingAddress;
      const error = validateAddress(address);

      if (error) {
        setValidationError(error);
        return;
      }

      const normalizedAddress = {
        fullName: String(address.fullName).trim(),
        email: String(address.email).trim(),
        phone: String(address.phone).trim(),
        address: String(address.address).trim(),
        city: String(address.city).trim(),
        state: String(address.state).trim(),
        postalCode: String(address.postalCode).trim(),
      };

      setCheckoutData((previous) => ({
        ...previous,
        ...stepData,
        shippingAddress: normalizedAddress,
      }));

      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      const method = stepData?.deliveryMethod;

      if (!['standard', 'express'].includes(method)) {
        setValidationError('Please select a valid delivery method.');
        return;
      }

      setCheckoutData((previous) => ({
        ...previous,
        ...stepData,
        deliveryMethod: method,
      }));

      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setValidationError('');
    setCurrentStep((previous) => Math.max(previous - 1, 1));
  };

  const shipping =
    cartItems.length === 0
      ? 0
      : checkoutData.deliveryMethod === 'express'
        ? 15
        : 5;

  const estimatedTax = roundMoney(Number(subtotal || 0) * 0.08);
  const total = roundMoney(Number(subtotal || 0) + shipping + estimatedTax);

  // Show confirmation before checking whether the cart is empty.
  if (orderConfirmation) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <CheckCircle size={56} className="mx-auto text-green-600" />

        <h1 className="mt-5 text-3xl font-bold text-gray-900">
          Order placed successfully!
        </h1>

        <p className="mt-3 text-gray-600">
          Thank you for shopping with CraftLocal. Your order has been saved.
        </p>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5 text-left">
          <div className="flex justify-between gap-4 py-2">
            <span className="text-gray-500">Order ID</span>
            <span className="break-all text-right font-medium text-gray-900">
              {orderConfirmation._id}
            </span>
          </div>

          <div className="flex justify-between gap-4 py-2">
            <span className="text-gray-500">Order status</span>
            <span className="font-medium text-gray-900">
              {orderConfirmation.status || 'Pending'}
            </span>
          </div>

          <div className="flex justify-between gap-4 py-2">
            <span className="text-gray-500">Payment method</span>
            <span className="font-medium text-gray-900">
              {String(orderConfirmation.paymentMethod || '').toUpperCase()}
            </span>
          </div>

          <div className="mt-2 flex justify-between gap-4 border-t border-gray-200 pt-4">
            <span className="font-semibold text-gray-900">Order total</span>
            <span className="font-bold text-[#A65D45]">
              {formatPrice(orderConfirmation.totalAmount)}
            </span>
          </div>
        </div>

        <Link
          to="/products"
          className="mt-6 inline-flex rounded-full bg-[#A65D45] px-6 py-3 font-semibold text-white transition hover:bg-[#8F4D39]"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <ShoppingBag size={48} className="mx-auto text-gray-400" />

        <h1 className="mt-5 text-2xl font-bold text-gray-900">
          Your cart is empty
        </h1>

        <p className="mt-2 text-gray-600">
          Add some products before proceeding to checkout.
        </p>

        <Link
          to="/products"
          className="mt-6 inline-flex rounded-full bg-[#A65D45] px-6 py-3 font-semibold text-white transition hover:bg-[#8F4D39]"
        >
          Explore products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 p-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to cart
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete your delivery and payment details.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b pb-4 text-sm font-medium">
          {[
            { step: 1, label: 'Address' },
            { step: 2, label: 'Delivery' },
            { step: 3, label: 'Payment' },
          ].map(({ step, label }) => (
            <React.Fragment key={step}>
              {step > 1 && <span className="text-gray-300">→</span>}

              <span
                className={
                  currentStep === step
                    ? 'font-bold text-[#A65D45]'
                    : currentStep > step
                      ? 'text-green-600'
                      : 'text-gray-400'
                }
              >
                {step}. {label}
              </span>
            </React.Fragment>
          ))}
        </div>

        {validationError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {validationError}
          </div>
        )}

        {currentStep === 1 && (
          <AddressForm
            onNext={handleNext}
            initialData={checkoutData.shippingAddress}
          />
        )}

        {currentStep === 2 && (
          <DeliveryMethod
            onNext={handleNext}
            onBack={handleBack}
            initialData={checkoutData.deliveryMethod}
          />
        )}

        {currentStep === 3 && (
          <PaymentSection
            checkoutData={{
              ...checkoutData,
              subtotal,
              shipping,
              tax: estimatedTax,
              total,
            }}
            onBack={handleBack}
            onOrderSuccess={setOrderConfirmation}
          />
        )}
      </div>

      <aside className="lg:col-span-1">
        <OrderSummary deliveryMethod={checkoutData.deliveryMethod} />
      </aside>
    </div>
  );
}
