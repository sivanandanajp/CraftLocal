
import React, { useState } from 'react';
import {
  ArrowLeft,
  Banknote,
  CheckCircle,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

import API from '../../services/api';
import { useCart } from '../../context/CartContext';

const paymentOptions = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    description: 'Pay using your credit or debit card.',
    Icon: CreditCard,
  },
  {
    id: 'upi',
    label: 'UPI',
    description: 'Pay using your UPI ID.',
    Icon: Smartphone,
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when your order is delivered.',
    Icon: Banknote,
  },
];

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#A65D45] focus:ring-1 focus:ring-[#A65D45]';

const formatCardNumber = (value) =>
  value
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2
    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
    : digits;
};

const isValidExpiry = (value) => {
  if (!/^\d{2}\/\d{2}$/.test(value)) return false;

  const [month, year] = value.split('/').map(Number);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  return (
    year > currentYear ||
    (year === currentYear && month >= currentMonth)
  );
};

const isValidLuhn = (number) => {
  let sum = 0;
  let doubleDigit = false;

  for (let i = number.length - 1; i >= 0; i -= 1) {
    let digit = Number(number[i]);

    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    doubleDigit = !doubleDigit;
  }

  return sum % 10 === 0;
};

const isValidUpi = (value) =>
  /^[a-zA-Z0-9._-]{2,}@[a-zA-Z][a-zA-Z0-9.-]{1,}$/.test(
    value.trim()
  );

export default function PaymentSection({
  checkoutData,
  onBack,
  onOrderSuccess,
}) {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cardholder, setCardholder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderSaved, setOrderSaved] = useState(false);

  const { cartItems, clearCart } = useCart();

  const validatePaymentDetails = () => {
    if (paymentMethod === 'card') {
      const digits = cardNumber.replace(/\D/g, '');

      if (cardholder.trim().length < 2) {
        return 'Please enter the cardholder name.';
      }

      if (
        digits.length < 13 ||
        digits.length > 19 ||
        !isValidLuhn(digits)
      ) {
        return 'Please enter a valid card number.';
      }

      if (!isValidExpiry(expiry)) {
        return 'Please enter a valid, unexpired expiry date.';
      }

      if (!/^\d{3,4}$/.test(cvv)) {
        return 'Please enter a valid CVV.';
      }
    }

    if (paymentMethod === 'upi' && !isValidUpi(upiId)) {
      return 'Please enter a valid UPI ID, such as name@bank.';
    }

    return '';
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (loading) return;

    setErrorMessage('');

    if (!cartItems.length) {
      setErrorMessage('Your cart is empty. Please add products first.');
      return;
    }

    if (!checkoutData?.shippingAddress) {
      setErrorMessage('Please enter your delivery address.');
      return;
    }

    const items = cartItems.map((item) => ({
      productId: item._id,
      quantity: Number(item.quantity),
    }));

    if (
      items.some(
        (item) =>
          !item.productId ||
          !Number.isSafeInteger(item.quantity) ||
          item.quantity < 1
      )
    ) {
      setErrorMessage(
        'Some cart items are invalid. Please return to your cart and try again.'
      );
      return;
    }

    const validationError = validatePaymentDetails();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);

    try {
      let paymentReference;

      // Step 1: Create a simulated payment session for card or UPI.
      // Card details, CVV and UPI ID are never sent to the backend.
      if (paymentMethod !== 'cod') {
        const paymentResponse = await API.post(
          '/orders/simulate-payment',
          { paymentMethod }
        );

        if (
          !paymentResponse.data?.success ||
          !paymentResponse.data?.paymentReference
        ) {
          throw new Error(
            paymentResponse.data?.message ||
              'Payment could not be completed. Please try again.'
          );
        }

        paymentReference = paymentResponse.data.paymentReference;
      }

      // Step 2: Create the order. Card and UPI require the payment
      // reference returned by the simulation endpoint.
      const orderPayload = {
        items,
        shippingAddress: checkoutData.shippingAddress,
        deliveryMethod: checkoutData.deliveryMethod,
        paymentMethod,
      };

      if (paymentReference) {
        orderPayload.paymentReference = paymentReference;
      }

      const orderResponse = await API.post('/orders', orderPayload);
      const order = orderResponse.data?.order;

      if (!order?._id) {
        throw new Error(
          'The server did not return an order confirmation.'
        );
      }

      // Step 3: Show confirmation and clear the cart only after
      // the backend confirms that the order was saved.
      setOrderSaved(true);

      if (onOrderSuccess) {
        onOrderSuccess(order);
      }

      clearCart();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          'Unable to place your order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (orderSaved) {
    return (
      <section className="rounded-lg border border-green-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle
          size={56}
          className="mx-auto text-green-600"
        />

        <h2 className="mt-4 text-2xl font-semibold text-gray-900">
          Order Placed Successfully!
        </h2>

        <p className="mt-2 text-gray-600">
          Your order has been saved. You can view it in your order history.
        </p>
      </section>
    );
  }

  return (
    <form
      onSubmit={handlePlaceOrder}
      className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          3. Payment Details
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose your preferred payment method.
        </p>
      </div>

      <div className="space-y-3">
        {paymentOptions.map(({ id, label, description, Icon }) => {
          const selected = paymentMethod === id;

          return (
            <button
              key={id}
              type="button"
              disabled={loading}
              onClick={() => {
                setPaymentMethod(id);
                setErrorMessage('');
              }}
              aria-pressed={selected}
              className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition ${
                selected
                  ? 'border-[#A65D45] bg-[#FAF7F1] ring-1 ring-[#A65D45]'
                  : 'border-gray-200 hover:border-gray-400'
              } ${loading ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <Icon
                size={22}
                className={selected ? 'text-[#A65D45]' : 'text-gray-500'}
              />

              <span className="flex-1">
                <span className="block font-medium text-gray-900">
                  {label}
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  {description}
                </span>
              </span>

              <span
                className={`mt-1 flex h-4 w-4 items-center justify-center rounded-full border ${
                  selected ? 'border-[#A65D45]' : 'border-gray-300'
                }`}
              >
                {selected && (
                  <span className="h-2 w-2 rounded-full bg-[#A65D45]" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {paymentMethod === 'card' && (
        <div className="space-y-4 rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900">
            Card Information
          </h3>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Cardholder Name
            </label>
            <input
              value={cardholder}
              onChange={(e) => setCardholder(e.target.value)}
              autoComplete="cc-name"
              className={inputClass}
              placeholder="Name on card"
              maxLength={80}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Card Number
            </label>
            <input
              value={cardNumber}
              onChange={(e) =>
                setCardNumber(formatCardNumber(e.target.value))
              }
              inputMode="numeric"
              autoComplete="cc-number"
              className={inputClass}
              placeholder="1234 5678 9012 3456"
              maxLength={23}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <input
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                inputMode="numeric"
                autoComplete="cc-exp"
                className={inputClass}
                placeholder="MM/YY"
                maxLength={5}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                CVV
              </label>
              <input
                type="password"
                value={cvv}
                onChange={(e) =>
                  setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                inputMode="numeric"
                autoComplete="cc-csc"
                className={inputClass}
                placeholder="CVV"
                maxLength={4}
                required
                disabled={loading}
              />
            </div>
          </div>

          <p className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck size={16} />
            Card information is not saved by this checkout.
          </p>
        </div>
      )}

      {paymentMethod === 'upi' && (
        <div className="space-y-3 rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900">Pay using UPI</h3>

          <div>
            <label className="text-sm font-medium text-gray-700">
              UPI ID
            </label>
            <input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value.trim())}
              className={inputClass}
              placeholder="yourname@bank"
              autoComplete="off"
              maxLength={100}
              required
              disabled={loading}
            />
          </div>
        </div>
      )}

      {paymentMethod === 'cod' && (
        <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">
          Pay for your order when it is delivered to your address.
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col-reverse justify-between gap-3 pt-2 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-6 py-2 text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <button
          type="submit"
          disabled={loading || cartItems.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#A65D45] px-6 py-2 font-semibold text-white transition hover:bg-[#8F4D39] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Processing...
            </>
          ) : paymentMethod === 'cod' ? (
            'Place Order'
          ) : (
            'Pay Now'
          )}
        </button>
      </div>
    </form>
  );
}
