
import React, { useState } from 'react';

export default function AddressForm({ onNext, initialData = {} }) {
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    addressLine: initialData.addressLine || initialData.address || '',
    city: initialData.city || '',
    state: initialData.state || '',
    postalCode: initialData.postalCode || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must contain at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    const normalizedPhone = formData.phone.replace(/[\s()-]/g, '');

    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone number.';
    } else if (!/^\+?\d{8,15}$/.test(normalizedPhone)) {
      newErrors.phone = 'Enter a valid phone number with 8–15 digits.';
    }

    if (!formData.addressLine.trim()) {
      newErrors.addressLine = 'Please enter your street address.';
    } else if (formData.addressLine.trim().length < 5) {
      newErrors.addressLine = 'Please enter a more complete address.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Please enter your city.';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Please enter your state.';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Please enter your postal code.';
    } else if (!/^[A-Za-z0-9 -]{3,10}$/.test(formData.postalCode.trim())) {
      newErrors.postalCode = 'Enter a valid postal code.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onNext({
      shippingAddress: {
        ...formData,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        addressLine: formData.addressLine.trim(),
        address: formData.addressLine.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
      },
    });
  };

  const inputClass = (field) =>
    `w-full rounded-md border p-2 focus:outline-none focus:ring-2 ${
      errors[field]
        ? 'border-red-500 focus:ring-red-200'
        : 'border-gray-300 focus:ring-blue-500'
    }`;

  const renderError = (field) =>
    errors[field] ? (
      <p className="mt-1 text-sm text-red-600" role="alert">
        {errors[field]}
      </p>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="mb-4 text-xl font-semibold">
        1. Shipping Address
      </h2>

      <div>
        <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
          Full Name *
        </label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          autoComplete="name"
          value={formData.fullName}
          onChange={handleChange}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          className={inputClass('fullName')}
          placeholder="Your full name"
        />
        {renderError('fullName')}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
          Email Address *
        </label>
        <input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          aria-invalid={Boolean(errors.email)}
          className={inputClass('email')}
          placeholder="you@example.com"
        />
        {renderError('email')}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
          Phone Number *
        </label>
        <input
          id="phone"
          type="tel"
          name="phone"
          autoComplete="tel"
          value={formData.phone}
          onChange={handleChange}
          aria-invalid={Boolean(errors.phone)}
          className={inputClass('phone')}
          placeholder="+91 9876543210"
        />
        {renderError('phone')}
      </div>

      <div>
        <label htmlFor="addressLine" className="mb-1 block text-sm font-medium text-gray-700">
          Street Address *
        </label>
        <textarea
          id="addressLine"
          name="addressLine"
          autoComplete="street-address"
          rows={3}
          value={formData.addressLine}
          onChange={handleChange}
          aria-invalid={Boolean(errors.addressLine)}
          className={inputClass('addressLine')}
          placeholder="House number, street, apartment"
        />
        {renderError('addressLine')}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="city" className="mb-1 block text-sm font-medium text-gray-700">
            City *
          </label>
          <input
            id="city"
            type="text"
            name="city"
            autoComplete="address-level2"
            value={formData.city}
            onChange={handleChange}
            aria-invalid={Boolean(errors.city)}
            className={inputClass('city')}
            placeholder="Kollam"
          />
          {renderError('city')}
        </div>

        <div>
          <label htmlFor="state" className="mb-1 block text-sm font-medium text-gray-700">
            State *
          </label>
          <input
            id="state"
            type="text"
            name="state"
            autoComplete="address-level1"
            value={formData.state}
            onChange={handleChange}
            aria-invalid={Boolean(errors.state)}
            className={inputClass('state')}
            placeholder="Kerala"
          />
          {renderError('state')}
        </div>
      </div>

      <div>
        <label htmlFor="postalCode" className="mb-1 block text-sm font-medium text-gray-700">
          Postal Code *
        </label>
        <input
          id="postalCode"
          type="text"
          name="postalCode"
          autoComplete="postal-code"
          value={formData.postalCode}
          onChange={handleChange}
          aria-invalid={Boolean(errors.postalCode)}
          className={inputClass('postalCode')}
          placeholder="691001"
        />
        {renderError('postalCode')}
      </div>

      <p className="text-xs text-gray-500">* Required fields</p>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
        >
          Continue to Delivery
        </button>
      </div>
    </form>
  );
}
